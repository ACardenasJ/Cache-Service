# 🧠 Documento Técnico – Plataforma RPG Multijugador por Turnos

## 🎯 Objetivo del Sistema

Mi objetivo es crear una plataforma multijugador online por turnos que sea robusta y escalable. Quiero que los jugadores puedan disfrutar de partidas fluidas, con comunicación en tiempo real y sin preocuparse por la infraestructura. Para lograrlo, he diseñado un sistema distribuido que maneja múltiples partidas activas, con almacenamiento seguro y escalabilidad automática y sobre todo usando la nube como herramienta principal de gestion de infraestrcurua.

Para lo anterior he decido usar AWS como plataforma cloud ya que es en la que mas experiencia he tenido los ultimos 4 años laboroales.

---

## 📦 Stack Tecnológico y Justificación

| Componente        | Tecnología                      | Justificación técnica                                                             |
|------------------|----------------------------------|-----------------------------------------------------------------------------------|
| Cliente del Juego| **Unreal Engine (C++)**          | Unreal por su potencia gráfica y la capacidad de exportar a cualquier plataforma y sobre todo por que en algun momento me gustaria aprenderla. |
| Backend API      | **NestJS (Node.js + TS)**        | NestJS esta diseñado para desarrollos distribuidos ademas nos da la modularidad que se necesita y se integra perfectamente con AWS.   |
| Cache Distribuida| **Redis (Elasticache)**          | Redis permite mantener el estado de las partidas en tiempo real de forma eficiente, sin ir a una base de datos directamante l oque ayuda a la latencia. |
| Persistencia     | **Amazon RDS (PostgreSQL)**      | PostgreSQL nos da la confiabilidad que se neceita para los datos importantes, los cuales no tiene que ser buscadops varias veces en uan partida.     |
| Mensajería       | **Amazon SQS**                   | SQS como plataforma de colas y eventos se usara con el fin de  mantener los servicios desacoplados y escalables.                  |
| Observabilidad   | **Datadog**                      | Con Datadog Se puede ver exactamente qué está pasando en nuestro sistema, a treves de la observacion de los flujos y los endpoints que se quiera segun la complejidad.            |
| Infraestructura  | **AWS + Terraform**              | Terraform permite crear y ademas replicar la infraestructura de forma consistente ya sea tanto en nube como en tirra y ademas con sutiles cambios podemos cambiar de nube de AWS a GCP sin mayores traumatimos.       |
| CI/CD            | **GitHub Actions + Docker + ECR**| Esto con el fin de automatizar todo el proceso de desarrollo y despliegue, lo que conocmos como CI/CD para asi dedicarse a otros factores mas importnes como la observalidad y el monitoreo.                         |

---

## 🧱 Arquitectura General

He diseñado la arquitectura siguiendo los principios de Clean Architecture y Hexagonal Architecture. Esto con el fin de tener el código organizado, mantenible, escalable y usnado principios SOLID como caracterisitica principal de todo desarrollo. Desde mi p[unto de vista y el diseño aqui mencionado los servicios se comunican entre sí de tres formas:

- **REST** para operaciones que necesitan respuesta inmediata.
- **WebSocket** para mantener a los jugadores conectados en tiempo real.
- **SQS** para eventos que pueden procesarse de forma asíncrona.

---

## 🧩 Microservicios y Responsabilidades

| Microservicio     | Función principal                                                                 |
|-------------------|-----------------------------------------------------------------------------------|
| `Auth Service`     | Se encarga de que los jugadores puedan registrarse y conectarse de forma segura.   |
| `Game Service`     | Maneja toda la lógica del juego y mantiene las partidas activas.                   |
| `MatchHistory`     | Guarda el historial de partidas y genera estadísticas interesantes.                |
| `Cache Service`    | Optimiza el rendimiento almacenando datos temporales de forma eficiente.          |

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

- Usamos contenedores en AWS ECS con Fargate para escalar automáticamente.
- Redis Cluster nos permite distribuir la carga.
- RDS se ajusta automáticamente según la necesidad.
- Desplegamos en múltiples zonas para mayor disponibilidad.
- Terraform nos ayuda a gestionar todo de forma consistente.

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

---

⭐️ Si te gusta el proyecto, no olvides darle una estrella en GitHub!
