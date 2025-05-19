# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src/ ./src/

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3002
ENV AWS_ELASTICACHE_ENDPOINT=""
ENV AWS_ELASTICACHE_PORT=6379
ENV AWS_ELASTICACHE_AUTH_TOKEN=""

# Exponer puerto
EXPOSE 3002

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"] 