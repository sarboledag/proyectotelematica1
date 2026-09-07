# 8. Alcance y trabajo restante

Este documento cubre los **ocho puntos requeridos por la Fase 1**:
descripción del problema, arquitectura, entidades participantes, tipos de
mensajes, sintaxis preliminar, reglas básicas de comunicación, máquinas de
estado y análisis preliminar TCP/UDP.

Queda explícitamente **fuera del alcance de esta fase**:

## Fase 2 — Implementación de comunicación básica (entrega 23 de septiembre)

- Implementación de los sockets Berkeley (crear / enlazar / escuchar / aceptar).
- Intercambio básico `REGISTER` / `TELEMETRY` / `EVENT` / `QUERY-*`.
- Parser de DMCP en C y en Python.
- Consolidación de los tamaños de campo de la especificación (estructura tipo RFC).

## Fase 3 — Concurrencia, resiliencia y pruebas (entrega 30 de septiembre)

- Modelo de concurrencia del SCS para atender varios nodos y clientes a la vez
  (se permite el uso de hilos).
- Todos los temporizadores y reintentos de
  [Reglas de comunicación § 5.4](5-Reglas-de-comunicacion#54-temporizadores-y-reintentos).
- Detección de nodos caídos y generación del evento `connectivity-loss`.
- Deduplicación y conteo de pérdidas de la telemetría UDP.
- Manejo exhaustivo de mensajes mal formados y parámetros inválidos.
- Batería de pruebas (múltiples clientes, peticiones inválidas, desconexiones).

---
**Anterior:** [← 7. Máquinas de estado](7-Maquinas-de-estado) · [Inicio](Home)
