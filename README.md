# Sistema de Monitoreo Distribuido y Control

Proyecto del curso Internet: Arquitectura y Protocolos (Telemática), 2026-2.

Una organización tiene una infraestructura distribuida de nodos (sensores,
equipos de red, dispositivos IoT) que hay que supervisar de forma remota. Cada
nodo reporta su estado de forma periódica y avisa de los eventos críticos que
ocurren. Un servidor central reúne toda esa información, mantiene el estado de la
infraestructura y responde las consultas de los clientes de administración.

La comunicación se hace con **DMCP** (*Distributed Monitoring and Control
Protocol*), un protocolo de capa de aplicación diseñado para el proyecto sobre un
transporte híbrido: UDP para la telemetría periódica y TCP para el registro, la
autenticación, los eventos críticos y las consultas.

## Componentes

| Componente | Lenguaje | Rol |
|---|---|---|
| SCS — Servidor Central de Supervisión | C (sockets Berkeley) | Recibe telemetría y eventos, mantiene el estado, responde consultas y atiende varios clientes a la vez |
| Nodo | Python | Reporta telemetría por UDP y eventos por TCP |
| Cliente de Administración | Python | Autentica, consulta el estado instantáneo y el histórico |
| AUTH — Servicio de Autenticación | Python | Gestiona usuarios y perfiles, emite tokens de sesión firmados |

## Documentación

El diseño completo de la Fase 1 está en la wiki:

**https://github.com/sarboledag/proyectotelematica1/wiki**

En `docs/fase1-diseno.pdf` hay una versión en PDF del mismo contenido. Se
reconstruye desde la wiki con `node scripts/build-pdf.mjs`.

## Estructura

```
docs/       Versión PDF del diseño
scripts/    Generación del PDF
server/     SCS (C)
node/       Nodo (Python)
client/     Cliente de administración (Python)
auth/       Servicio de autenticación (Python)
common/     Definiciones compartidas del protocolo
logs/       Logs de ejecución
```

## Avance

- [x] Fase 1 — Diseño y arquitectura (9 de septiembre)
- [ ] Fase 2 — Implementación de la comunicación básica (23 de septiembre)
- [ ] Fase 3 — Concurrencia, resiliencia y pruebas (30 de septiembre)

## Equipo

- Santiago Arboleda ([@sarboledag](https://github.com/sarboledag))
- Samuel Orozco
