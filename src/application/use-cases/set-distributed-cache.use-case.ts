/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';

@Injectable()
export class SetDistributedCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async execute(key: string, value: any, ttl?: number, quorum?: number): Promise<void> {
    const item = new CacheItem(key, value, ttl);
    await this.cacheRepository.setWithConsistency(item, quorum);
  }
} 