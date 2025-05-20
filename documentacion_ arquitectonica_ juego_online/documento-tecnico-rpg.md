# 🧠 Documento Técnico – Plataforma RPG Multijugador por Turnos

## 🎯 Objetivo del Sistema

Nuestro objetivo es crear una plataforma multijugador online por turnos que sea robusta, escalable y divertida. Queremos que los jugadores puedan disfrutar de partidas fluidas, con comunicación en tiempo real y sin preocuparse por la infraestructura. Para lograrlo, hemos diseñado un sistema distribuido que maneja múltiples partidas activas, con almacenamiento seguro y escalabilidad automática, todo desplegado sobre AWS.

---

## 📦 Stack Tecnológico y Justificación

| Componente        | Tecnología                      | Justificación técnica                                                             |
|------------------|----------------------------------|-----------------------------------------------------------------------------------|
| Cliente del Juego| **Unreal Engine (C++)**          | Elegimos Unreal por su potencia gráfica y la capacidad de exportar a cualquier plataforma |
| Backend API      | **NestJS (Node.js + TS)**        | NestJS nos da la modularidad que necesitamos y se integra perfectamente con AWS   |
| Cache Distribuida| **Redis (Elasticache)**          | Redis nos permite mantener el estado de las partidas en tiempo real de forma eficiente |
| Persistencia     | **Amazon RDS (PostgreSQL)**      | PostgreSQL nos da la confiabilidad que necesitamos para los datos importantes     |
| Mensajería       | **Amazon SQS**                   | SQS nos ayuda a mantener los servicios desacoplados y escalables                  |
| Observabilidad   | **Datadog**                      | Con Datadog podemos ver exactamente qué está pasando en nuestro sistema           |
| Infraestructura  | **AWS + Terraform**              | Terraform nos permite replicar nuestra infraestructura de forma consistente       |
| CI/CD            | **GitHub Actions + Docker + ECR**| Automatizamos todo el proceso de desarrollo y despliegue                          |

---

## 🧱 Arquitectura General

Hemos diseñado la arquitectura siguiendo los principios de Clean Architecture y Hexagonal Architecture. Esto nos permite mantener el código organizado y fácil de mantener. Los servicios se comunican entre sí de tres formas:

- **REST** para operaciones que necesitan respuesta inmediata
- **WebSocket** para mantener a los jugadores conectados en tiempo real
- **SQS** para eventos que pueden procesarse de forma asíncrona

---

## 🧩 Microservicios y Responsabilidades

| Microservicio     | Función principal                                                                 |
|-------------------|-----------------------------------------------------------------------------------|
| `Auth Service`     | Se encarga de que los jugadores puedan registrarse y conectarse de forma segura   |
| `Game Service`     | Maneja toda la lógica del juego y mantiene las partidas activas                   |
| `MatchHistory`     | Guarda el historial de partidas y genera estadísticas interesantes                |
| `Cache Service`    | Optimiza el rendimiento almacenando datos temporales de forma eficiente           |

---

## 💾 Estrategias de Almacenamiento y Gestión de Datos

| Capa         | Tecnología              | Uso principal                                                         |
|--------------|--------------------------|-----------------------------------------------------------------------|
| Temporal     | Redis Cluster (Elasticache) | Guardamos el estado de las partidas en curso y datos que cambian frecuentemente |
| Persistente  | Amazon RDS (PostgreSQL)     | Almacenamos información importante como perfiles y estadísticas       |
| Mensajería   | Amazon SQS                  | Usamos SQS para comunicar eventos importantes entre servicios         |

---

## ⚙️ Mecanismos de Escalabilidad

Para asegurarnos de que el sistema pueda crecer con la demanda:

- Usamos contenedores en AWS ECS con Fargate para escalar automáticamente
- Redis Cluster nos permite distribuir la carga
- RDS se ajusta automáticamente según la necesidad
- Desplegamos en múltiples zonas para mayor disponibilidad
- Terraform nos ayuda a gestionar todo de forma consistente

---

## 🧱 Tolerancia a Fallos

Nadie quiere perder una partida por un error técnico, por eso:

- Los servicios están desacoplados usando SQS
- Redis tiene réplicas para mayor seguridad
- RDS mantiene backups automáticos
- Monitoreamos todo con Datadog para detectar problemas antes
- WebSocket se recupera automáticamente si hay problemas

---

## 🔐 Seguridad

La seguridad es una prioridad:

- Usamos JWT para autenticación segura
- Validamos tokens en cada petición
- Controlamos el acceso por roles
- Limitamos las peticiones para prevenir abusos
- Todo se comunica por HTTPS
- Mantenemos logs detallados de todo

---

## 🔄 Flujo del Juego

Así es como funciona una partida:

1. El jugador inicia sesión y recibe su token
2. Se conecta a la partida vía WebSocket
3. El servidor valida y procesa cada acción
4. Guardamos el estado en Redis para acceso rápido
5. Notificamos a otros servicios vía SQS
6. Al terminar, guardamos todo en la base de datos
7. Actualizamos las estadísticas del jugador

---

## 🧠 Observabilidad y CI/CD

Para mantener todo funcionando bien:

- Todos los servicios envían logs a Datadog
- Monitoreamos partidas activas y rendimiento
- Tenemos dashboards personalizados
- Automatizamos pruebas y despliegues
- Gestionamos la infraestructura con Terraform

---

## 📐 Diagrama Arquitectónico

Puedes ver el diseño completo en `CIII JIKKO.drawio`, que incluye:

- Cómo se conecta el cliente
- Cómo fluyen los datos
- Dónde se almacena cada cosa
- Cómo se comunican los servicios
- Cómo monitoreamos todo

---

## 👨‍💻 Autor
- **Nombre**: Andrés Eduardo Cárdenas Jaramillo
- **GitHub**: https://github.com/ACardenasJ/Cache-Service.git
- **Rol**: Arquitecto de Software
- **Especialidad**: Desarrollo Back-end y Sistemas Distribuidos

## 📅 Versión
- **Fecha**: Mayo 2024
- **Versión**: 1.0.0
- **Estado**: En desarrollo activo

## 🙏 Agradecimientos
- NestJS Team por el increíble framework
- Redis por la excelente base de datos
- AWS por la infraestructura robusta
- Todos los contribuidores que han ayudado a mejorar el proyecto

## 📞 Soporte
Si encuentras algún problema o tienes sugerencias, por favor:
- Abre un issue en GitHub
- Contacta al autor directamente
- Únete a nuestro canal de Discord

## 🔄 Roadmap
- [ ] Implementación de caché multi-nivel
- [ ] Soporte para más backends de caché
- [ ] Dashboard de monitoreo
- [ ] Integración con más sistemas de métricas
- [ ] Mejoras en la documentación
- [ ] Más ejemplos de uso

---

⭐️ Si te gusta el proyecto, no olvides darle una estrella en GitHub!