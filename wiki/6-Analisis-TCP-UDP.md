# 6. Análisis preliminar sobre el uso de TCP y UDP

El objetivo no es decidir cuál protocolo es "mejor", sino asignar a cada tipo de
mensaje el transporte cuyas garantías coinciden con las necesidades del mensaje.

## 6.1 Criterios de análisis

Para cada tipo de mensaje se consideran: tolerancia a pérdidas, frecuencia de
transmisión, tamaño, criticidad de la información, necesidad de orden, necesidad
de confiabilidad, necesidad de mantener una conexión, comportamiento ante
retardos y ante pérdidas.

## 6.2 Tabla de decisión por tipo de mensaje

| Mensaje | Tolera pérdida | Frecuencia | Tamaño | Criticidad | Requiere orden | Requiere confiabilidad | Requiere conexión | **Transporte** |
|---|---|---|---|---|---|---|---|---|
| `TELEMETRY` | **Sí** (el próximo dato lo reemplaza) | Alta (cada 5 s) | Pequeño (1 datagrama) | Baja | No (se usa `Ts`) | No | No | **UDP** |
| `REGISTER` / `REGISTER-ACK` | No | Una vez por sesión | Pequeño | Alta (sin registro no hay nodo) | Sí | Sí | Sí | **TCP** |
| `EVENT` / `EVENT-ACK` | **No** (puede tener consecuencias graves) | Baja, esporádica | Pequeño-medio | **Alta** | Sí | Sí | Sí | **TCP** |
| `HEARTBEAT` | Sí (individual), pero varios seguidos ⇒ nodo caído | Media (cada 10 s) | Mínimo | Media (señal de vida) | No | No | Sí (reutiliza la conexión de control) | **TCP** (sobre la conexión existente) |
| `COMMAND` / `COMMAND-RESULT` | No | Rara | Pequeño | Alta (control del nodo) | Sí | Sí | Sí | **TCP** |
| `AUTH-LOGIN` / `AUTH-TOKEN` | No | Rara | Pequeño | Alta (credenciales) | Sí | Sí | Sí | **TCP** |
| `SESSION` / consultas `QUERY-*` / `RESPONSE` | No | Media (interacción del usuario) | Medio-grande (histórico, listas) | Media-alta | Sí | Sí | Sí | **TCP** |
| `UPDATE` (suscripción) | Sí (el estado se puede volver a consultar) | Variable | Pequeño | Media | No | No estricta | Sí (canal cliente) | **TCP** (sobre el canal de sesión ya abierto) |

## 6.3 Racional

### Por qué UDP para `TELEMETRY`

- El enunciado dice explícitamente que "la pérdida ocasional de alguno de estos
  mensajes puede ser tolerable, siempre que la información sea actualizada
  periódicamente". El valor de una muestra caduca cuando llega la siguiente.
- Alta frecuencia × muchos nodos ⇒ mantener una conexión TCP con *estado* y
  control de congestión por cada flujo de telemetría es un costo innecesario.
- No se requiere orden estricto: el SCS usa la marca `Ts` y el `Seq` para quedarse
  con la muestra más reciente y descartar duplicados/rezagados.
- Ante retardo: una muestra que llega tarde ya no es útil; con TCP el
  *head-of-line blocking* retrasaría además las muestras siguientes. Con UDP cada
  datagrama es independiente.

### Por qué TCP para `EVENT`

- "En estos casos, la pérdida de un mensaje puede tener consecuencias importantes."
  ⇒ se necesita **entrega confiable y ordenada**.
- Son mensajes **poco frecuentes**: el costo de TCP es despreciable.
- Reutilizan la **conexión de control ya abierta** del nodo, así que no hay
  *handshake* adicional por evento.
- Permiten confirmación extremo a extremo (`EVENT-ACK`) y, si falla, el nodo
  puede encolar el evento y reintentar tras reconectar.

### Por qué una conexión TCP de control persistente por nodo

- Da al SCS una señal directa de disponibilidad: si el socket se cierra, el nodo
  cayó, y se genera el evento "pérdida de conectividad" sin esperar temporizadores
  largos.
- Sirve de canal bidireccional para `COMMAND` (SCS → nodo).
- Sobre esa misma conexión viajan `REGISTER`, `EVENT` y `HEARTBEAT`: un solo
  socket de control por nodo.

### Mecanismos de confiabilidad sobre UDP (definidos, uso reservado)

DMCP define un mecanismo genérico para cuando un mensaje UDP necesite
confiabilidad: el emisor marca `Flags: ACK_REQ`, arranca un temporizador
(500 ms, *backoff* exponencial, máx. 3 intentos) y retransmite con el **mismo
`Seq`**; el receptor responde `*-ACK` con `Ack-Seq` y **deduplica por `Seq`**
dentro de una ventana. En el diseño actual **ningún** mensaje UDP usa este
mecanismo (la telemetría no lo necesita); queda especificado por si en la Fase 3
se decide mover algún mensaje a UDP con garantías. No se reimplementa TCP.

## 6.4 Resumen

- **UDP:** `TELEMETRY` (único).
- **TCP:** todo lo demás — registro, *heartbeats*, eventos, comandos,
  autenticación, sesiones de cliente y consultas.
- La arquitectura final es una **combinación de TCP y UDP**, justificada mensaje
  a mensaje según § 6.2.

---
**Anterior:** [← 5. Reglas de comunicación](5-Reglas-de-comunicacion) · **Siguiente:** [7. Máquinas de estado →](7-Maquinas-de-estado)
