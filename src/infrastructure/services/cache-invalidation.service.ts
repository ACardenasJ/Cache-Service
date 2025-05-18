/* eslint-disable prettier/prettier */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { Inject } from '@nestjs/common';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { ICacheInvalidationService } from '../../domain/services/cache-invalidation.service.interface';
import { RedisService } from './redis.service';

@Injectable()
export class CacheInvalidationService implements OnModuleInit, ICacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);
  private readonly cleanupInterval = 5000; // 5 segundos
  private readonly patterns: Map<string, RegExp> = new Map();

  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    // Iniciar el proceso de limpieza periódica
    setInterval(() => this.cleanupExpiredItems(), this.cleanupInterval);
  }

  /**
   * Registra un patrón para invalidación automática
   * @param pattern Patrón de clave (puede incluir wildcards *)
   * @param ttl Tiempo de vida en segundos
   */
  registerInvalidationPattern(pattern: string, ttl: number): void {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    this.patterns.set(pattern, regexPattern);
    this.logger.log(`Patrón de invalidación registrado: ${pattern} con TTL: ${ttl}s`);
  }

  /**
   * Invalida todas las claves que coincidan con un patrón
   * @param pattern Patrón de clave
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    const regex = this.patterns.get(pattern);
    if (!regex) {
      throw new Error(`Patrón no registrado: ${pattern}`);
    }

    // Obtener todas las claves y filtrar por el patrón
    const nodes = await this.cacheRepository.getNodes();
    for (const node of nodes) {
      try {
        // Aquí iría la lógica para obtener las claves del nodo
        // y aplicar el patrón de invalidación
        this.logger.debug(`Invalidando claves en nodo ${node.nodeId} con patrón: ${pattern}`);
      } catch (error) {
        this.logger.error(`Error invalidando en nodo ${node.nodeId}: ${error.message}`);
      }
    }
  }

  /**
   * Invalida una clave específica en todos los nodos
   * @param key Clave a invalidar
   */
  async invalidateKey(key: string): Promise<void> {
    const nodes = await this.cacheRepository.getNodes();
    await Promise.all(
      nodes.map(async node => {
        try {
          await this.cacheRepository.delete(key);
          this.logger.debug(`Clave ${key} invalidada en nodo ${node.nodeId}`);
        } catch (error) {
          this.logger.error(`Error invalidando clave ${key} en nodo ${node.nodeId}: ${error.message}`);
        }
      })
    );
  }

  async invalidateCache(key: string): Promise<void> {
    try {
      await this.cacheRepository.delete(key);
      this.logger.log(`Cache invalidated for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache for key ${key}: ${error.message}`);
      throw error;
    }
  }

  async invalidateCachePattern(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const keys = await this.redisService.keys(pattern);
      
      for (const key of keys) {
        if (regex.test(key)) {
          await this.invalidateCache(key);
        }
      }
      
      this.logger.log(`Cache invalidated for pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache pattern ${pattern}: ${error.message}`);
      throw error;
    }
  }

  async scheduleInvalidation(item: CacheItem): Promise<void> {
    try {
      if (item.ttl) {
        const timeout = setTimeout(async () => {
          await this.invalidateCache(item.key);
        }, item.ttl * 1000);

        // Almacenar el timeout para posible cancelación
        await this.redisService.set(`invalidation:${item.key}`, timeout.toString(), item.ttl);
      }
    } catch (error) {
      this.logger.error(`Error scheduling invalidation for ${item.key}: ${error.message}`);
      throw error;
    }
  }

  async cancelScheduledInvalidation(key: string): Promise<void> {
    try {
      const timeoutId = await this.redisService.get(`invalidation:${key}`);
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
        await this.redisService.del(`invalidation:${key}`);
        this.logger.log(`Cancelled scheduled invalidation for key: ${key}`);
      }
    } catch (error) {
      this.logger.error(`Error cancelling invalidation for ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Limpia los elementos expirados de la caché
   */
  private async cleanupExpiredItems(): Promise<void> {
    try {
      const keys = await this.redisService.keys('*');
      for (const key of keys) {
        const exists = await this.redisService.exists(key);
        if (!exists) {
          await this.invalidateCache(key);
        }
      }
    } catch (error) {
      this.logger.error(`Error in cleanup: ${error.message}`);
    }
  }
} 