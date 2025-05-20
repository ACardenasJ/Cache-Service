import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

@Injectable()
export class LocalCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly cleanupInterval = 60000; // 1 minuto

  constructor(private readonly logger: LoggerService) {
    // Iniciar limpieza periódica
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  set(key: string, value: any, ttl: number): void {
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiresAt });
    this.logger.debug(`Local cache set for key: ${key}, TTL: ${ttl}s`);
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) {
      this.logger.debug(`Local cache miss for key: ${key}`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Local cache expired for key: ${key}`);
      return null;
    }

    this.logger.debug(`Local cache hit for key: ${key}`);
    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Local cache deleted for key: ${key}`);
  }

  clear(): void {
    this.cache.clear();
    this.logger.debug('Local cache cleared');
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.logger.debug(`Cleaned up ${expiredCount} expired entries from local cache`);
    }
  }

  // Métodos para estadísticas y monitoreo
  getStats(): any {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000))
      }))
    };
  }
} 