# 7. Máquinas de estado

Las máquinas de estado describen el comportamiento de cada entidad, incluyendo
los caminos de error (no solo el caso feliz).

## 7.1 Nodo

```mermaid
stateDiagram-v2
    [*] --> INIT
    INIT --> RESOLVIENDO: cargar configuración
    RESOLVIENDO --> CONECTANDO: nombre resuelto
    RESOLVIENDO --> ESPERA_RETRY: fallo DNS
    ESPERA_RETRY --> RESOLVIENDO: backoff cumplido
    CONECTANDO --> REGISTRANDO: TCP establecida
    CONECTANDO --> ESPERA_RETRY: conexión rechazada
    REGISTRANDO --> ACTIVO: REGISTER-ACK recibido
    REGISTRANDO --> ESPERA_RETRY: timeout (3 intentos)
    ACTIVO --> ACTIVO: operación normal (telemetría, heartbeat, eventos)
    ACTIVO --> DEGRADADO: sin HEARTBEAT-ACK / sin EVENT-ACK
    DEGRADADO --> ACTIVO: ACK recuperado
    DEGRADADO --> RECONECTANDO: socket de control caído
    RECONECTANDO --> REGISTRANDO: TCP restablecida
    RECONECTANDO --> ESPERA_RETRY: fallo
    ACTIVO --> DETENIENDO: señal de apagado
    DEGRADADO --> DETENIENDO: señal de apagado
    DETENIENDO --> [*]: DEREGISTER enviado
```

## 7.2 SCS — sesión de un nodo

```mermaid
stateDiagram-v2
    [*] --> ESCUCHANDO
    ESCUCHANDO --> CONEXION_ABIERTA: accept() de conexión de control
    CONEXION_ABIERTA --> REGISTRADO: REGISTER válido (Node-Key correcta)
    CONEXION_ABIERTA --> ESCUCHANDO: REGISTER inválido → ERROR 401/409, cerrar
    REGISTRADO --> ACTIVO: primera TELEMETRY o HEARTBEAT
    ACTIVO --> ACTIVO: telemetría / evento → actualizar estado, histórico y notificar
    ACTIVO --> SOSPECHOSO: 2× heartbeat_interval sin HEARTBEAT
    SOSPECHOSO --> ACTIVO: HEARTBEAT recibido
    SOSPECHOSO --> DESCONECTADO: 3× heartbeat_interval sin HEARTBEAT / socket cerrado
    DESCONECTADO --> ACTIVO: el nodo se vuelve a registrar (mismo Node-Id)
    ACTIVO --> RETIRADO: DEREGISTER
    DESCONECTADO --> RETIRADO: expira la retención
    RETIRADO --> [*]
    note right of DESCONECTADO
        Al entrar: generar evento
        connectivity-loss y notificar
        a los clientes suscritos.
        El histórico se conserva.
    end note
```

## 7.3 Cliente de Administración

```mermaid
stateDiagram-v2
    [*] --> INIT
    INIT --> RESOLVIENDO
    RESOLVIENDO --> AUTENTICANDO: nombre de AUTH resuelto
    RESOLVIENDO --> ERROR_RED: fallo DNS
    AUTENTICANDO --> SESION_SCS: AUTH-TOKEN recibido
    AUTENTICANDO --> AUTENTICANDO: credenciales inválidas → reintento del usuario
    SESION_SCS --> LISTO: SESSION-ACK
    SESION_SCS --> ERROR_RED: ERROR 401 → volver a AUTENTICANDO
    LISTO --> CONSULTANDO: el usuario lanza una consulta
    CONSULTANDO --> LISTO: RESPONSE mostrada
    CONSULTANDO --> LISTO: ERROR mostrada
    LISTO --> REAUTENTICANDO: token expirado (ERROR 401)
    REAUTENTICANDO --> SESION_SCS: nuevo token
    LISTO --> CERRANDO: el usuario sale
    ERROR_RED --> RESOLVIENDO: reintento con backoff
    CERRANDO --> [*]
```

## 7.4 SCS — sesión de un cliente

```mermaid
stateDiagram-v2
    [*] --> ACEPTADA
    ACEPTADA --> AUTENTICADA: SESSION(token) con firma válida y no expirado
    ACEPTADA --> [*]: token inválido → ERROR 401, cerrar
    AUTENTICADA --> SIRVIENDO: procesar QUERY-* / SUBSCRIBE / ADMIN-CMD
    SIRVIENDO --> AUTENTICADA: RESPONSE enviada
    SIRVIENDO --> AUTENTICADA: ERROR 403/404/422 enviado
    AUTENTICADA --> CERRADA: socket cerrado por el cliente o token expira
    SIRVIENDO --> CERRADA: socket cerrado
    CERRADA --> [*]
```

---
**Anterior:** [← 6. Análisis TCP vs UDP](6-Analisis-TCP-UDP) · **Siguiente:** [8. Alcance y trabajo restante →](8-Alcance-y-trabajo-restante)
