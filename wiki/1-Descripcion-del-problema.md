# 1. Descripción general del problema

Una organización opera una infraestructura distribuida compuesta por múltiples
**nodos** (sensores, equipos de red, dispositivos IoT) que deben ser
supervisados de forma remota. Cada nodo debe:

- Informar **periódicamente** su estado mediante métricas de telemetría
  (utilización de CPU, temperatura, nivel de batería, estado operativo,
  disponibilidad, métricas de funcionamiento).
- Reportar la ocurrencia de **eventos críticos** (fallas, superación de
  umbrales, pérdida de conectividad, alarmas, cambios importantes de estado).

Un **Servidor Central de Supervisión (SCS)** recibe la información de todos los
nodos, mantiene un estado actualizado de la infraestructura y permite que
**clientes de administración** consulten dicha información. No existe
comunicación directa entre nodos y clientes: los nodos escriben hacia el SCS y
los clientes leen desde el SCS.

El sistema tiene dos clases de información con requisitos de comunicación
opuestos:

| Clase | Ejemplo | Pérdida de un mensaje | Frecuencia |
|---|---|---|---|
| Telemetría periódica | CPU 42 %, T 51 °C | Tolerable si el dato se actualiza pronto | Alta (cada pocos segundos) |
| Eventos críticos | "batería < 5 %", "enlace caído" | **No tolerable**, puede tener consecuencias graves | Baja y esporádica |

Esta diferencia es la que motiva un diseño de transporte **híbrido**
(ver [Análisis TCP vs UDP](6-Analisis-TCP-UDP)).

## 1.1 Objetivos de la solución

1. Integrar **varios protocolos reales de capa de aplicación** cooperando en un
   mismo sistema: un servicio de **resolución de nombres** (DNS), un servicio de
   **autenticación centralizada** (AUTH) y el servicio de **supervisión y
   petición de recursos** (SCS + DMCP).
2. Diseñar un protocolo de capa de aplicación (**DMCP**) cuya especificación sea
   suficientemente clara para que un tercero pueda implementarlo.
3. Justificar técnicamente el uso de TCP y/o UDP para cada tipo de mensaje.
4. Soportar **múltiples clientes concurrentes** y control de excepciones.

## 1.2 Alcance de la Fase 1

Se entrega: descripción del problema, arquitectura, entidades participantes,
catálogo de mensajes, sintaxis preliminar, reglas básicas de comunicación,
máquinas de estado y análisis preliminar TCP/UDP. **No** se implementa código
funcional en esta fase.

---
**Siguiente:** [2. Arquitectura →](2-Arquitectura)
