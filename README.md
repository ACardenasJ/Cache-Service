<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Cache Service – Servicio de Caché Distribuido con NestJS

📌 Autor: Andrés Eduardo Cárdenas Jaramillo
🎓 Rol: Arquitecto de Software

Este proyecto es una implementación completa de un servicio de caché distribuido, diseñado usando el framework NestJS, integrando Redis como backend de almacenamiento. Su propósito es proporcionar una solución robusta, eficiente y escalable para guardar información temporal de forma segura, con tiempos de vida configurables y mecanismos de invalidez.

## 🚀 ¿Qué hace este servicio?

Este microservicio permite:

- Guardar temporalmente datos (como el estado de una partida)
- Consultarlos por clave o por patrones
- Invalidarlos manualmente o por patrón
- Caducar automáticamente si pasa el tiempo configurado (TTL)
- Caché local para optimizar el rendimiento
- Monitoreo y estadísticas del caché

Ideal para aplicaciones multijugador, plataformas colaborativas o sistemas que necesitan rendimiento bajo alta carga.

## 📦 Requisitos del entorno

Para ejecutar correctamente este servicio, necesitas:

- Node.js v18 o superior
- npm o yarn
- Redis (puede ser local, en Docker o desde AWS ElastiCache)
- Docker (opcional, para ejecutar el servicio como contenedor)

## 🧰 Tecnologías utilizadas

| Tecnología  | Uso principal                           |
|-------------|----------------------------------------|
| NestJS      | Framework y estructura del proyecto     |
| Redis       | Almacenamiento de caché distribuida     |
| TypeScript  | Tipado estático y mantenibilidad       |
| Jest        | Pruebas unitarias y de integración     |
| Docker      | Containerización y despliegue          |
| Winston     | Sistema de logging estructurado        |
| Helmet      | Seguridad y headers HTTP               |

## 🔧 Instalación y configuración

1. Clona el repositorio y navega al directorio
```bash
git chttps://github.com/ACardenasJ/Cache-Service.git
cd cache-service
```

2. Instala dependencias
```bash
npm install
```

3. Configura las variables de entorno en `.env`:
```bash
NODE_ENV=development
PORT=3002
AWS_ELASTICACHE_ENDPOINT=localhost
AWS_ELASTICACHE_PORT=6379
AWS_ELASTICACHE_AUTH_TOKEN=  # Solo si tu Redis requiere autenticación
```

## 🏃 Cómo ejecutar el servicio

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run start:prod
```

## 🧪 Pruebas

Este proyecto incluye pruebas unitarias que validan la lógica del servicio:

```bash
# Ejecutar todas las pruebas
npm run test

# Ver cobertura de código
npm run test:cov
```

## 🐳 Soporte para Docker

### 1. Construir imagen Docker
```bash
docker build -t cache-service .
```

### 2. Ejecutar contenedor
```bash
docker run -p 3002:3002 \
  -e AWS_ELASTICACHE_ENDPOINT=localhost \
  -e AWS_ELASTICACHE_PORT=6379 \
  -e AWS_ELASTICACHE_AUTH_TOKEN=your-auth-token \
  cache-service
```

## 🔌 Endpoints REST disponibles

### Operaciones de Caché Distribuido
| Método | Ruta                    | Descripción                          |
|--------|-------------------------|--------------------------------------|
| GET    | /cache/:key            | Recupera un elemento de la caché     |
| POST   | /cache                 | Guarda un elemento en caché          |
| DELETE | /cache/:key            | Elimina un elemento de la caché      |
| GET    | /cache/pattern/:pattern| Obtiene elementos por patrón         |
| DELETE | /cache/pattern/:pattern| Elimina elementos por patrón         |

### Operaciones de Caché Local
| Método | Ruta                    | Descripción                          |
|--------|-------------------------|--------------------------------------|
| DELETE | /cache/local/:key      | Elimina una entrada del caché local  |
| DELETE | /cache/local           | Limpia todo el caché local           |
| GET    | /cache/local/stats     | Obtiene estadísticas del caché local |

### Monitoreo
| Método | Ruta     | Descripción                    |
|--------|----------|--------------------------------|
| GET    | /health  | Estado de salud del servicio   |

## 🚀 Características del Caché Local

El servicio implementa un sistema de caché local que:

- Reduce la latencia en consultas frecuentes
- Disminuye la carga en Redis
- Gestión automática de TTL
- Limpieza automática de entradas expiradas
- Estadísticas y monitoreo en tiempo real
- Invalidación manual cuando sea necesario

### Configuración del Caché Local

El caché local se puede configurar por endpoint usando el decorador `@UseLocalCache`:

```typescript
@Get(':key')
@UseLocalCache({ ttl: 30 }) // 30 segundos de caché
async get(@Param('key') key: string): Promise<any> {
  return this.cacheService.get(key);
}
```

### Estadísticas del Caché Local

El endpoint `/cache/local/stats` devuelve:

```json
{
  "size": 10,
  "entries": [
    {
      "key": "usuario:123",
      "expiresIn": 25  // segundos restantes
    }
  ]
}
```

## 📁 Estructura del Proyecto
```bash
src/
├── domain/                # Entidades y reglas de negocio
│   ├── entities/
│   └── interfaces/
├── application/          # Casos de uso y servicios
│   └── use-cases/
├── infrastructure/       # Implementaciones concretas
│   ├── security/
│   ├── logging/
│   └── repositories/
├── interfaces/          # Controllers y DTOs
│   ├── controllers/
│   └── dto/
└── main.ts             # Punto de entrada
```

## 🔐 Medidas de seguridad implementadas

- Rate limiting para prevenir abusos
- Protección CORS configurable
- Endpoints protegidos por permisos
- Headers seguros con Helmet
- TTL configurable para prevenir saturación

## 📊 Observabilidad y monitoreo

El servicio implementa las siguientes características:

- Logs estructurados con Winston
- Rotación diaria de archivos de log
- Formato JSON para mejor procesamiento
- Timestamps precisos y contexto
- Monitoreo de salud del servicio

## 📝 Licencia

Este proyecto está licenciado bajo la licencia MIT.
