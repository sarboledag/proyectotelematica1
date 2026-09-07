# 3. Entidades participantes

## 3.1 Nodo

- **Rol:** representa un elemento supervisado. Genera y envía telemetría y eventos.
- **Identidad:** `node_id` (cadena única) + `node_key` (secreto precompartido para registrarse).
- **Responsabilidades:**
  - Resolver el nombre del SCS y establecer la conexión de control TCP.
  - Registrarse (`REGISTER`) y recibir parámetros operativos (intervalo de telemetría, intervalo de *heartbeat*, puerto UDP del SCS).
  - Enviar `TELEMETRY` por UDP cada `telemetry_interval`.
  - Enviar `EVENT` por TCP ante una condición crítica, con confirmación obligatoria.
  - Enviar `HEARTBEAT` por TCP cada `heartbeat_interval`.
  - Atender `COMMAND` del SCS (p. ej. cambiar el intervalo, forzar una lectura).
  - Reconectarse ante caídas de la conexión de control.
- **Estado que mantiene:** su `session_id`, número de secuencia de telemetría, últimos parámetros operativos.

## 3.2 SCS — Servidor Central de Supervisión

- **Rol:** núcleo del sistema. Único componente en C.
- **Responsabilidades (requisito 3 del enunciado):**
  - a) Registrar los nodos que participan.
  - b) Recibir información periódica de estado (telemetría UDP).
  - c) Recibir eventos generados por los nodos (TCP, con ACK).
  - d) Mantener el estado de los nodos conectados (vivo/sospechoso/desconectado, últimas métricas, histórico).
  - e) Responder consultas sobre la infraestructura.
  - f) Atender **múltiples clientes de forma concurrente**.
- **Además:** *logging* en consola y archivo de toda petición/respuesta, incluyendo el identificador del cliente (IP y puerto de origen); recibe `puerto` y `archivoDeLogs` por consola.
- **Estado que mantiene:**
  - `registry[node_id] → { direccion_control, udp_endpoint, perfil_metricas, estado, ultimo_heartbeat, ultima_telemetria, ultimo_seq_udp }`
  - `history[node_id][metric] → buffer circular de N muestras (timestamp, valor)`
  - `events → lista de eventos recientes (node_id, tipo, severidad, timestamp, descripción, estado_ack)`
  - `sessions → sesiones de cliente activas (token válido, perfil, socket)`

## 3.3 Cliente de Administración

- **Rol:** consulta el estado de la infraestructura. No modifica nodos salvo perfil `admin`.
- **Responsabilidades:**
  - Autenticarse contra AUTH (`AUTH-LOGIN`) y obtener un token.
  - Abrir sesión con el SCS presentando el token (`SESSION`).
  - Consultar: lista de nodos con estado instantáneo, detalle de un nodo, **histórico (≥ 5 muestras)**, eventos.
  - Mostrar la información en una **interfaz de visualización sencilla**.
  - Perfil `admin`: enviar comandos a un nodo a través del SCS.
- **Estado que mantiene:** token y su expiración, `session_id` del SCS, perfil.

## 3.4 AUTH — Servicio de Autenticación

- **Rol:** autenticación centralizada y gestión de perfiles de usuario.
- **Responsabilidades:**
  - Mantener el almacén de usuarios (usuario, *hash* de contraseña con *salt*, perfil).
  - Validar credenciales (`AUTH-LOGIN`) y emitir un **token firmado** (`AUTH-TOKEN`).
  - Cerrar sesión (`AUTH-LOGOUT`) y, opcionalmente, publicar una lista de revocación.
- **Perfiles previstos:**

| Perfil | Permisos |
|---|---|
| `viewer` | Leer estado instantáneo de nodos |
| `operator` | `viewer` + leer histórico y eventos + suscribirse a actualizaciones |
| `admin` | `operator` + enviar comandos de control a los nodos |

## 3.5 DNS

Servicio de resolución de nombres (no se implementa; se usa el del sistema). Todo
componente resuelve los nombres de sus pares mediante `getaddrinfo`. El manejo de
fallo de resolución es un requisito explícito (ver
[Reglas de comunicación § 5.5](5-Reglas-de-comunicacion#55-manejo-de-excepciones-requisito-11)).

---
**Anterior:** [← 2. Arquitectura](2-Arquitectura) · **Siguiente:** [4. Protocolo DMCP →](4-Protocolo-DMCP)
