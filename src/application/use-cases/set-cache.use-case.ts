import { Injectable, Inject } from '@nestjs/common';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';

@Injectable()
export class SetCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async execute(key: string, value: any, ttl?: number): Promise<void> {
    const cacheItem = new CacheItem(key, value, ttl);
    await this.cacheRepository.set(cacheItem);
  }
} 