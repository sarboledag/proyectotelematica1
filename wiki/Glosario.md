# Glosario

| Término | Definición |
|---|---|
| **DMCP** | *Distributed Monitoring and Control Protocol* — protocolo de capa de aplicación diseñado para este proyecto |
| **SCS** | Servidor Central de Supervisión (componente en C) |
| **AUTH** | Servicio de autenticación centralizada |
| **Nodo** | Elemento supervisado que emite telemetría y eventos |
| **Cliente** | Aplicación de administración que consulta el estado de la infraestructura |
| **Telemetría** | Métricas de estado enviadas periódicamente (CPU, temperatura, batería, …) |
| **Evento** | Notificación de una condición crítica y esporádica |
| **Heartbeat** | Mensaje periódico mínimo que indica que el nodo sigue vivo |
| **Token** | Credencial de sesión firmada con HMAC-SHA256 emitida por AUTH |
| **Sesión** | Contexto identificado por `Session` entre un par y el SCS |
| **Backoff** | Espera creciente entre reintentos (p. ej. 5 s, 10 s, 20 s, …) |
| **Head-of-line blocking** | En TCP, un segmento perdido detiene la entrega de los siguientes hasta su retransmisión |

---
[Inicio](Home)
