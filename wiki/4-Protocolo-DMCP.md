# 4. Protocolo DMCP — formato de mensajes (sintaxis preliminar)

**DMCP** — *Distributed Monitoring and Control Protocol*, versión 1.0 (preliminar).

## 4.1 Justificación del formato

DMCP usa un **formato de texto orientado a líneas**, estilo RFC 822 / HTTP
(cabeceras `Clave: valor`, línea en blanco, cuerpo opcional). Motivos:

- **Interoperabilidad C ↔ Python:** el parsing en C se resuelve con
  `recv` + búsqueda de `\r\n\r\n` + `sscanf`/`strtok`, sin librerías externas.
- **Depurable:** cumple mejor el requisito de *logging* legible de
  peticiones y respuestas.
- **Extensible:** añadir una cabecera no rompe a un receptor antiguo.

En la Fase 2 se documentará también el tamaño de cada campo; los campos son
UTF-8 de longitud variable y el cuerpo se delimita con la cabecera `Length`.

## 4.2 Estructura general

```
DMCP/1.0 <TIPO> <TRANSPORTE>\r\n
Seq: <entero sin signo>\r\n
Session: <id de sesión | 0>\r\n
Ts: <timestamp epoch en ms>\r\n
[<Cabecera-Especifica>: <valor>\r\n]...
Length: <n>\r\n
\r\n
<cuerpo de n bytes>
```

- **Línea de inicio:** versión, `TIPO` de mensaje, `TRANSPORTE` esperado
  (`TCP` o `UDP`) — permite detectar un mensaje enviado por el canal equivocado.
- `Seq`: número de secuencia por conexión (TCP) o por sesión (UDP).
- `Session`: `0` mientras el emisor no tiene sesión establecida.
- `Ts`: marca de tiempo del emisor (para ordenar telemetría y fechar eventos).
- `Length`: longitud del cuerpo en bytes (0 si no hay cuerpo).

## 4.3 Flags de control (cabecera `Flags`)

| Flag | Significado |
|---|---|
| `ACK_REQ` | El emisor exige confirmación de este mensaje |
| `ACK` | Este mensaje **es** una confirmación (ver `Ack-Seq`) |
| `ERR` | Este mensaje transporta un error (cuerpo = descripción, ver tipo `ERROR`) |

## 4.4 Catálogo de mensajes

### Plano de control nodo ↔ SCS (TCP)

| TIPO | Dirección | Cabeceras específicas | Cuerpo | ACK |
|---|---|---|---|---|
| `REGISTER` | Nodo → SCS | `Node-Id`, `Node-Key`, `Udp-Port` | Lista de métricas ofrecidas y capacidades | `REGISTER-ACK` |
| `REGISTER-ACK` | SCS → Nodo | `Session`, `Telemetry-Interval`, `Heartbeat-Interval`, `Udp-Endpoint` | — | — |
| `HEARTBEAT` | Nodo → SCS | — | — | `HEARTBEAT-ACK` |
| `HEARTBEAT-ACK` | SCS → Nodo | `Ack-Seq` | — | — |
| `EVENT` | Nodo → SCS | `Event-Id`, `Severity` (`info`/`warning`/`critical`), `Event-Type` | Descripción + instantánea de métricas | `EVENT-ACK` (`ACK_REQ` siempre) |
| `EVENT-ACK` | SCS → Nodo | `Ack-Seq`, `Event-Id` | — | — |
| `COMMAND` | SCS → Nodo | `Command-Id`, `Action` (`set-interval`/`read-now`/`reset`) | Parámetros | `COMMAND-RESULT` |
| `COMMAND-RESULT` | Nodo → SCS | `Ack-Seq`, `Command-Id`, `Status` | Detalle | — |
| `DEREGISTER` | Nodo → SCS | `Reason` | — | `REGISTER-ACK` (cierre ordenado) |

### Plano de datos nodo → SCS (UDP)

| TIPO | Dirección | Cabeceras específicas | Cuerpo | ACK |
|---|---|---|---|---|
| `TELEMETRY` | Nodo → SCS | `Session`, `Seq` | Muestras `metrica=valor` separadas por `;` | No (salvo `ACK_REQ` explícito) |
| `TELEMETRY-ACK` | SCS → Nodo | `Ack-Seq` | — | Solo si el `TELEMETRY` pidió `ACK_REQ` |

### Plano de cliente (TCP)

| TIPO | Dirección | Cabeceras / cuerpo | Respuesta |
|---|---|---|---|
| `AUTH-LOGIN` | Cliente → AUTH | cuerpo: `user`, `password` | `AUTH-TOKEN` o `ERROR` |
| `AUTH-TOKEN` | AUTH → Cliente | `Profile`, `Expires-At`; cuerpo: token | — |
| `AUTH-LOGOUT` | Cliente → AUTH | cuerpo: token | `OK` o `ERROR` |
| `SESSION` | Cliente → SCS | cuerpo: token | `SESSION-ACK` o `ERROR` |
| `SESSION-ACK` | SCS → Cliente | `Session`, `Profile` | — |
| `QUERY-NODES` | Cliente → SCS | `Filter` (opcional: `state=active`) | `RESPONSE` (lista de nodos + estado instantáneo) |
| `QUERY-NODE` | Cliente → SCS | `Node-Id` | `RESPONSE` (detalle + última telemetría) |
| `QUERY-HISTORY` | Cliente → SCS | `Node-Id`, `Metric`, `Count` (≥ 5) | `RESPONSE` (muestras históricas) |
| `QUERY-EVENTS` | Cliente → SCS | `Node-Id` (opcional), `Severity` (opcional), `Count` | `RESPONSE` (lista de eventos) |
| `SUBSCRIBE` | Cliente → SCS | `Node-Id` / `all` | `RESPONSE` + `UPDATE` asíncronos |
| `UPDATE` | SCS → Cliente | `Node-Id` | Cambio de estado / nueva telemetría / nuevo evento |
| `ADMIN-CMD` | Cliente (`admin`) → SCS | `Node-Id`, `Action`, parámetros | `RESPONSE`; el SCS reenvía como `COMMAND` al nodo |
| `RESPONSE` | SCS → Cliente | `Ack-Seq`, `Status` | cuerpo con el resultado |
| `ERROR` | cualquiera | `Ack-Seq`, `Code` | cuerpo: descripción legible |

## 4.5 Códigos de error (`ERROR` / cabecera `Code`)

| Código | Significado |
|---|---|
| `400 BAD_FORMAT` | Mensaje mal formado o cabecera obligatoria ausente |
| `401 UNAUTHENTICATED` | Falta token o token inválido/expirado |
| `403 FORBIDDEN` | El perfil no permite la operación |
| `404 UNKNOWN_NODE` | El `Node-Id` no existe |
| `409 ALREADY_REGISTERED` | El nodo ya tiene una sesión activa |
| `422 INVALID_PARAM` | Parámetro fuera de rango |
| `429 RATE_LIMITED` | Exceso de mensajes |
| `500 INTERNAL` | Error interno del servidor |
| `503 UNAVAILABLE` | Dependencia no disponible (p. ej. AUTH) |

## 4.6 Ejemplos

**Registro de un nodo (TCP):**

```
DMCP/1.0 REGISTER TCP
Seq: 1
Session: 0
Ts: 1757203200000
Node-Id: sensor-bodega-01
Node-Key: 9f2c1a7b4e
Udp-Port: 41000
Length: 46

metrics=cpu,temp,battery,status,availability
```

**Respuesta del SCS:**

```
DMCP/1.0 REGISTER-ACK TCP
Seq: 1
Session: 7731
Ts: 1757203200110
Ack-Seq: 1
Telemetry-Interval: 5
Heartbeat-Interval: 10
Udp-Endpoint: scs.telematica.local:5000
Length: 0

```

**Telemetría (UDP, sin ACK):**

```
DMCP/1.0 TELEMETRY UDP
Seq: 148
Session: 7731
Ts: 1757203945000
Length: 47

cpu=0.42;temp=51.3;battery=0.87;status=ok
```

**Evento crítico (TCP, con ACK obligatorio):**

```
DMCP/1.0 EVENT TCP
Seq: 12
Session: 7731
Ts: 1757203950000
Flags: ACK_REQ
Event-Id: sensor-bodega-01-000009
Severity: critical
Event-Type: threshold-exceeded
Length: 39

temp=88.1; umbral=80.0; accion=alarma
```

**Consulta de histórico (cliente → SCS):**

```
DMCP/1.0 QUERY-HISTORY TCP
Seq: 3
Session: 5510
Ts: 1757204000000
Node-Id: sensor-bodega-01
Metric: temp
Count: 5
Length: 0

```

---
**Anterior:** [← 3. Entidades participantes](3-Entidades-participantes) · **Siguiente:** [5. Reglas de comunicación →](5-Reglas-de-comunicacion)
