import { applyDecorators, SetMetadata } from '@nestjs/common';

export const LOCAL_CACHE_KEY = 'local_cache';
export interface LocalCacheOptions {
  ttl?: number;  // Tiempo de vida en segundos
  key?: string | ((args: any[]) => string);  // Clave personalizada o función generadora
}

export function UseLocalCache(options: LocalCacheOptions = {}) {
  return applyDecorators(
    SetMetadata(LOCAL_CACHE_KEY, {
      ttl: options.ttl || 60, // 1 minuto por defecto
      key: options.key || null,
    }),
  );
} 