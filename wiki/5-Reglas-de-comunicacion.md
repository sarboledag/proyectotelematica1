# 5. Reglas básicas de comunicación

## 5.1 Establecimiento

1. Todo componente **resuelve por nombre** la dirección de su par (`getaddrinfo`).
2. **Nodo:** abre conexión TCP de control con el SCS → `REGISTER` → espera
   `REGISTER-ACK` con `Session` y parámetros → inicia telemetría UDP y *heartbeats*.
3. **Cliente:** conexión TCP con AUTH → `AUTH-LOGIN` → `AUTH-TOKEN` → cierra con
   AUTH → conexión TCP con el SCS → `SESSION(token)` → `SESSION-ACK` → consultas.

## 5.2 Numeración y correlación

- Cada emisor numera sus mensajes con `Seq` **creciente** (por conexión TCP; por
  sesión en UDP).
- Toda respuesta o confirmación incluye `Ack-Seq` con el `Seq` del mensaje al que
  responde. Así el emisor correlaciona pregunta y respuesta aunque lleguen
  intercaladas.

## 5.3 Confirmaciones

- `REGISTER`, `EVENT`, `COMMAND`, `ADMIN-CMD` y las consultas **siempre** se
  confirman (con `*-ACK` o `RESPONSE`).
- `TELEMETRY` **no** se confirma por defecto (ver [Análisis TCP vs UDP](6-Analisis-TCP-UDP)).
- `HEARTBEAT` se confirma con `HEARTBEAT-ACK`; sirve para medir latencia y
  detectar un enlace degradado.

## 5.4 Temporizadores y reintentos

| Situación | Temporizador | Acción al expirar |
|---|---|---|
| Nodo espera `REGISTER-ACK` | 3 s | Reintentar hasta 3 veces; luego *backoff* exponencial (5 s, 10 s, 20 s, …, máx 60 s) |
| Nodo espera `EVENT-ACK` | 2 s | Retransmitir el mismo `Event-Id` hasta 3 veces; si falla, encolar en disco y reintentar tras reconexión |
| Nodo espera `HEARTBEAT-ACK` | 2 × `heartbeat_interval` | Marcar la conexión como sospechosa; forzar reconexión |
| SCS no recibe `HEARTBEAT` de un nodo | 3 × `heartbeat_interval` | Estado del nodo → `DESCONECTADO`; generar evento `connectivity-loss`; notificar a los clientes suscritos |
| Cliente espera `RESPONSE` | 5 s | Reintentar 1 vez; luego informar error al usuario |

## 5.5 Manejo de excepciones (requisito 11)

| Situación | Comportamiento definido |
|---|---|
| Fallo de resolución DNS | Capturar la excepción, registrarla en el log, reintentar con *backoff*. **El proceso no termina.** |
| Conexión TCP rechazada o caída | Reintentar con *backoff*; el nodo conserva su `node_id` y vuelve a registrarse; el SCS conserva el histórico del nodo. |
| Mensaje mal formado | Responder `ERROR 400 BAD_FORMAT` (si hay canal), registrar, **descartar** el mensaje y **mantener** la conexión. |
| Cabecera obligatoria ausente / valor fuera de rango | `ERROR 400` o `ERROR 422`, descartar el mensaje. |
| Token inválido o expirado | `ERROR 401`; el cliente debe repetir `AUTH-LOGIN`. |
| Operación no permitida por el perfil | `ERROR 403`, registrar el intento. |
| `Node-Id` desconocido en una consulta | `ERROR 404 UNKNOWN_NODE`. |
| Datagrama UDP de sesión desconocida | Descartar silenciosamente (posible sesión caída); registrar a nivel *debug*. |
| Telemetría con `Seq` menor o igual al último visto | Descartar (mensaje duplicado o fuera de orden); actualizar contador de pérdidas/duplicados. |

## 5.6 Cierre

- **Nodo:** `DEREGISTER(Reason)` → el SCS confirma y marca el nodo como
  `RETIRADO` (conserva su histórico como dato histórico).
- **Cliente:** cierra el socket; el SCS libera la sesión. Token sigue válido
  hasta su expiración salvo `AUTH-LOGOUT`.
- **Caída abrupta:** detectada por cierre de socket TCP o expiración de
  temporizador (§ 5.4).

## 5.7 Registro (*logging*, requisito de implementación)

Cada petición y cada respuesta que procesa el SCS se escribe **en consola y en
`archivoDeLogs`**, con: timestamp, identificador del cliente/nodo (`IP:puerto`
de origen), `TIPO`, `Seq`, `Session`, resultado (`Status`/`Code`).

Formato de línea de log (preliminar):

```
2026-09-09T14:32:05.114Z  RX  192.168.1.20:41522  QUERY-HISTORY  seq=3 session=5510  node=sensor-bodega-01 metric=temp count=5
2026-09-09T14:32:05.119Z  TX  192.168.1.20:41522  RESPONSE       seq=3 ack=3 status=200  rows=5
```

---
**Anterior:** [← 4. Protocolo DMCP](4-Protocolo-DMCP) · **Siguiente:** [6. Análisis TCP vs UDP →](6-Analisis-TCP-UDP)
