# Sistema de Monitoreo Distribuido y Control

Wiki del proyecto del curso **Internet: Arquitectura y Protocolos (Telemática) — 2026-2**.

Sistema distribuido para supervisar de forma remota un conjunto de nodos
(sensores, equipos de red, dispositivos IoT). Los nodos reportan telemetría
periódica y eventos críticos a un servidor central; los clientes de
administración consultan el estado de la infraestructura.

**Protocolo de capa de aplicación:** DMCP — *Distributed Monitoring and Control Protocol*, versión 1.0 (preliminar).

---

## Fase 1 — Diseño y arquitectura

> Documento preliminar. La sintaxis y las máquinas de estado se refinarán en las
> Fases 2 y 3, donde se consolidará la especificación completa con estructura
> tipo RFC.

| # | Página | Contenido |
|---|---|---|
| 1 | [Descripción del problema](1-Descripcion-del-problema) | Qué resuelve el sistema, objetivos, alcance de la fase |
| 2 | [Arquitectura](2-Arquitectura) | Composición mínima, componentes, decisiones de diseño, configuración |
| 3 | [Entidades participantes](3-Entidades-participantes) | Nodo, SCS, Cliente, AUTH, DNS |
| 4 | [Protocolo DMCP](4-Protocolo-DMCP) | Formato de mensajes, catálogo, sintaxis preliminar, ejemplos |
| 5 | [Reglas de comunicación](5-Reglas-de-comunicacion) | Establecimiento, ACKs, temporizadores, manejo de excepciones |
| 6 | [Análisis TCP vs UDP](6-Analisis-TCP-UDP) | Decisión de transporte, justificada mensaje a mensaje |
| 7 | [Máquinas de estado](7-Maquinas-de-estado) | Nodo, sesión de nodo en el SCS, cliente, sesión de cliente |
| 8 | [Alcance y trabajo restante](8-Alcance-y-trabajo-restante) | Qué queda para las Fases 2 y 3 |
|   | [Glosario](Glosario) | Términos |

## Componentes del sistema

| Componente | Lenguaje | Rol |
|---|---|---|
| **SCS** – Servidor Central de Supervisión | C (sockets Berkeley) | Recibe telemetría y eventos, mantiene el estado, responde consultas, atiende clientes concurrentes |
| **Nodo** | Python | Reporta telemetría (UDP) y eventos (TCP) al SCS |
| **Cliente de Administración** | Python | Autentica, consulta estado instantáneo e histórico |
| **AUTH** – Servicio de Autenticación | Python | Gestiona usuarios y perfiles, emite tokens de sesión firmados |

## Cronograma

- [x] **Fase 1 — Diseño y arquitectura** (entrega 9 de septiembre)
- [ ] Fase 2 — Implementación de comunicación básica (entrega 23 de septiembre)
- [ ] Fase 3 — Concurrencia, resiliencia y pruebas (entrega 30 de septiembre)

## Repositorio

El código y este documento en formato único (Markdown y PDF) están en
[`sarboledag/proyectotelematica1`](https://github.com/sarboledag/proyectotelematica1)
→ carpeta `docs/`.

## Equipo

_Completar con los integrantes del grupo._
