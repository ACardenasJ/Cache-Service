import { Injectable, Inject } from '@nestjs/common';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';

@Injectable()
export class CompareAndSetCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async execute(key: string, expectedValue: any, newValue: any, ttl?: number): Promise<boolean> {
    const currentCacheItem = await this.cacheRepository.get(key);
    
    // Si el valor actual coincide con el valor esperado, actualizamos
    if (currentCacheItem?.value === expectedValue) {
      const newCacheItem = new CacheItem(key, newValue, ttl);
      await this.cacheRepository.set(newCacheItem);
      return true;
    }

    // Si no coincide, retornamos false indicando que no se pudo actualizar
    return false;
  }
} 