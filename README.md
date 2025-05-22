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

# 🚀 Cache Service

Un servicio de caché distribuido y local construido con NestJS, diseñado para ofrecer alta disponibilidad y rendimiento en entornos de microservicios.

## 👨‍💻 Autor
- **Nombre**: Andrés Eduardo Cárdenas Jaramillo
- **GitHub**: ACardenasJ

## 🌟 Características Principales

- **Caché Distribuido**: Implementación robusta usando Redis para almacenamiento distribuido
- **Caché Local**: Caché en memoria para acceso rápido a datos frecuentes
- **Alta Disponibilidad**: Configuración de quorum para garantizar consistencia
- **Monitoreo**: Endpoints de salud y estadísticas en tiempo real
- **Seguridad**: Implementación de ACL y autenticación JWT
- **Documentación**: API documentada con Swagger
- **Logging**: Sistema de logs detallado para debugging

## 🛠️ Tecnologías

- **Framework**: NestJS
- **Base de Datos**: Redis
- **Documentación**: Swagger
- **Testing**: Jest
- **Containerización**: Docker
- **CI/CD**: GitHub Actions

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/cache-service.git
cd cache-service
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Inicia el servicio:
```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## ⚙️ Configuración

### Variables de Entorno

```env
# Puerto del servicio
PORT=3002

# Configuración Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Configuración JWT
JWT_SECRET=your_secret
JWT_EXPIRATION=1h

# Configuración Caché
CACHE_TTL=3600
CACHE_QUORUM=2
```

### Docker

```bash
# Construir imagen
docker build -t cache-service .

# Ejecutar contenedor
docker run -p 3002:3002 cache-service
```

## 🔌 Endpoints REST

### Operaciones de Caché
| Método | Ruta                    | Descripción                          | Parámetros |
|--------|-------------------------|--------------------------------------|------------|
| GET    | /cache/:key            | Recupera un elemento de la caché     | `key`: string |
| POST   | /cache                 | Guarda un elemento en caché          | `key`: string, `value`: any, `ttl?`: number, `quorum?`: number |
| DELETE | /cache/:key            | Elimina un elemento de la caché      | `key`: string |
| GET    | /cache/keys            | Lista claves del caché               | `pattern?`: string |

### Patrones de Invalidación
| Método | Ruta                    | Descripción                          | Parámetros |
|--------|-------------------------|--------------------------------------|------------|
| POST   | /cache/pattern         | Elimina elementos por patrón         | `pattern`: string |
| POST   | /cache/compare-and-set | Actualización atómica con CAS        | `key`: string, `expectedValue`: any, `newValue`: any, `ttl?`: number |

### Monitoreo
| Método | Ruta     | Descripción                    | Parámetros |
|--------|----------|--------------------------------|------------|
| GET    | /health  | Estado de salud del servicio   | - |

## 📝 Ejemplos de Uso

### 1. Almacenar un valor
```bash
curl -X POST http://localhost:3002/cache \
  -H "Content-Type: application/json" \
  -d '{
    "key": "usuario:123",
    "value": {
      "nombre": "Juan",
      "email": "juan@ejemplo.com"
    },
    "ttl": 3600,
    "quorum": 2
  }'
```

### 2. Recuperar un valor
```bash
curl -X GET http://localhost:3002/cache/usuario:123
```

### 3. Eliminar por patrón
```bash
curl -X POST http://localhost:3002/cache/pattern \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "usuario:*"
  }'
```

## 🏗️ Estructura del Proyecto

```
src/
├── application/          # Casos de uso y lógica de negocio
├── domain/              # Entidades y reglas de negocio
├── infrastructure/      # Implementaciones técnicas
│   ├── controllers/     # Controladores REST
│   ├── repositories/    # Implementaciones de repositorios
│   └── services/        # Servicios técnicos
└── interfaces/          # Interfaces y DTOs
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📊 Monitoreo y Métricas

El servicio expone endpoints para monitoreo:

- `/health`: Estado general del servicio
- `/cache/local/stats`: Estadísticas del caché local
- `/metrics`: Métricas Prometheus (opcional)

## 🔒 Seguridad

- Autenticación JWT
- Control de acceso basado en roles (RBAC)
- Rate limiting
- Validación de entrada
- Sanitización de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## �� Agradecimientos

- NestJS Team por el increíble framework
- Redis por la excelente base de datos
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
