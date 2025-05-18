# 🧠 Documento Técnico – Plataforma RPG Multijugador por Turnos

## 🎯 Objetivo del Sistema

Diseñar, implementar y desplegar una plataforma multijugador online por turnos, capaz de manejar múltiples partidas activas con comunicación en tiempo real, almacenamiento seguro, escalabilidad automática y separación por microservicios bajo un enfoque de arquitectura hexagonal, orientada a eventos, y desplegada sobre AWS.

---

## 📦 Stack Tecnológico y Justificación

| Componente        | Tecnología                      | Justificación técnica                                                             |
|------------------|----------------------------------|-----------------------------------------------------------------------------------|
| Cliente del Juego| **Unreal Engine (C++)**          | Motor gráfico avanzado, permite exportación a WebGL, nativo y móvil              |
| Backend API      | **NestJS (Node.js + TS)**        | Modular, compatible con WebSocket y REST, integración sencilla con AWS           |
| Cache Distribuida| **Redis (Elasticache)**          | Almacenamiento temporal rápido y TTL, clave para partidas en tiempo real         |
| Persistencia     | **Amazon RDS (PostgreSQL)**      | Consistencia fuerte, relaciones complejas, backups automáticos                   |
| Mensajería       | **Amazon SQS**                   | Comunicación asíncrona entre microservicios, desacoplamiento                     |
| Observabilidad   | **Datadog**                      | Logs estructurados, trazabilidad, dashboards personalizados                      |
| Infraestructura  | **AWS + Terraform**              | IAC modular, despliegue reproducible en staging y producción                     |
| CI/CD            | **GitHub Actions + Docker + ECR**| Pipeline automatizado para pruebas, build y despliegue en contenedores           |

---

## 🧱 Arquitectura General

La arquitectura sigue principios de **Clean Architecture** + **Hexagonal Architecture**, separando lógica de dominio de infraestructura.

La comunicación entre microservicios se da por:
- **REST** para acciones síncronas
- **WebSocket** para tiempo real
- **SQS** para eventos asincrónicos desacoplados (ej. `TurnEnded`, `MatchAbandoned`)

---

## 🧩 Microservicios y Responsabilidades

| Microservicio     | Función principal                                                                 |
|-------------------|-----------------------------------------------------------------------------------|
| `Auth Service`     | Registro/login de usuarios, generación y validación de JWT                       |
| `Game Service`     | Lógica del juego por turnos, reglas, conexión WebSocket, almacenamiento en Redis |
| `MatchHistory`     | Lectura del historial de partidas, reportes y estadísticas desde RDS             |
| `Cache Service`    | Interfaz REST sobre Redis. Claves, TTL, jugadores activos, sincronización rápida |

---

## 💾 Estrategias de Almacenamiento y Gestión de Datos

| Capa         | Tecnología              | Uso principal                                                         |
|--------------|--------------------------|-----------------------------------------------------------------------|
| Temporal     | Redis Cluster (Elasticache) | Estado de partidas activas, TTL, jugadores conectados               |
| Persistente  | Amazon RDS (PostgreSQL)     | Usuarios, partidas finalizadas, turnos históricos                    |
| Mensajería   | Amazon SQS                  | Eventos asincrónicos: finalización de turno, abandono, auditoría     |

Redis se usa vía `Cache Service`, que abstrae el acceso mediante API REST.  
RDS se accede desde `Game Service` y `MatchHistory` para persistencia y reporting.  
SQS conecta `GameService`, `EventDispatcher` y `MatchHistory` de forma desacoplada.

---

## ⚙️ Mecanismos de Escalabilidad

- Servicios contenedorizados sobre **AWS ECS con Fargate**
- Redis Cluster soporta partición y replicación
- RDS Multi-AZ con autoescalado vertical
- Despliegue en múltiples zonas de disponibilidad
- Terraform permite escalar infraestructura declarativamente

---

## 🧱 Tolerancia a Fallos

- Servicios desacoplados por medio de Amazon SQS
- Redis con réplicas y reintentos automáticos
- RDS configurado con alta disponibilidad y backups automáticos
- Monitoreo con Datadog para actuar ante errores o picos de latencia
- WebSocket con reintento automático y fallback a polling si es necesario

---

## 🔐 Seguridad

- Autenticación JWT (Bcrypt para contraseñas)
- Middleware en Gateway y WS para validación de tokens
- Control de acceso por roles (RBAC)
- CORS habilitado y rate-limiting en API Gateway
- Logs auditables en Datadog
- HTTPS obligatorio en frontend y backend

---

## 🔄 Flujo del Juego

1. El jugador inicia sesión → recibe JWT
2. Se conecta a WebSocket para unirse a una partida
3. `Game Service` valida el turno → procesa acción
4. Guarda estado temporal en Redis
5. Publica evento `TurnEnded` en SQS
6. Al finalizar, guarda en RDS
7. `MatchHistory` consume SQS y actualiza estadísticas

---

## 🧠 Observabilidad y CI/CD

- Todos los servicios emiten logs estructurados a **Datadog**
- Monitoreo de partidas activas, errores, latencia por servicio
- Dashboards y alertas configurables
- GitHub Actions ejecuta pruebas, build y despliegue continuo
- Terraform gestiona el ciclo de vida completo de la infraestructura

---

## 📐 Diagrama Arquitectónico

El diseño detallado se encuentra en `CIII JIKKO.drawio`, incluyendo:

- Cliente Unreal
- API Gateway
- Microservicios REST y WS
- Redis y RDS
- SQS como middleware de eventos
- Observabilidad centralizada