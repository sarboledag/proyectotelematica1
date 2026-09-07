# Sistema de Monitoreo Distribuido y Control

Proyecto del curso **Internet: Arquitectura y Protocolos (Telemática) — 2026-2**.

Sistema distribuido para supervisar de forma remota un conjunto de nodos
(sensores, equipos de red, dispositivos IoT). Los nodos reportan telemetría
periódica y eventos críticos a un servidor central; clientes de administración
consultan el estado de la infraestructura.

## Componentes

| Componente | Lenguaje | Rol |
|---|---|---|
| **SCS** – Servidor Central de Supervisión | C (sockets Berkeley) | Recibe telemetría y eventos, mantiene el estado, responde consultas, atiende clientes concurrentes |
| **Nodo** | Python | Reporta telemetría (UDP) y eventos (TCP) al SCS |
| **Cliente de Administración** | Python | Autentica, consulta estado instantáneo e histórico, interfaz sencilla |
| **AUTH** – Servicio de Autenticación | Python | Gestiona usuarios y perfiles, emite tokens de sesión firmados |

## Documentación

Todo el diseño de la Fase 1 vive en la **wiki** (fuente única):

**<https://github.com/sarboledag/proyectotelematica1/wiki>**

- `docs/fase1-diseno.pdf` — versión PDF (snapshot para entrega).
- Regenerar el PDF desde la wiki: `node scripts/build-pdf.mjs` (ver el script).
- Editar la wiki: en la web, o `git clone https://github.com/sarboledag/proyectotelematica1.wiki.git`

## Protocolo

**DMCP** (*Distributed Monitoring and Control Protocol*) — protocolo de capa de
aplicación diseñado para este proyecto.

Transporte: **híbrido TCP + UDP**. UDP para telemetría periódica (tolerante a
pérdidas); TCP para registro, autenticación, eventos críticos y consultas.

## Estructura del repositorio

```
docs/            fase1-diseno.pdf (snapshot del diseño; la fuente es la wiki)
scripts/         build-pdf.mjs — genera el PDF desde la wiki
server/          SCS — servidor central en C  (src/, include/)
node/            Nodo en Python
client/          Cliente de administración en Python
auth/            Servicio de autenticación en Python
common/          Definiciones compartidas del protocolo (constantes, formato)
logs/            Archivos de log generados en ejecución (ignorados por git)
```

## Estado

- [x] **Fase 1 — Diseño y arquitectura** (entrega 9 de septiembre)
- [ ] Fase 2 — Implementación de comunicación básica (entrega 23 de septiembre)
- [ ] Fase 3 — Concurrencia, resiliencia y pruebas (entrega 30 de septiembre)

## Equipo

_Completar con los integrantes del grupo._
