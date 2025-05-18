import { Injectable, Inject } from '@nestjs/common';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { LoggerService } from '../../infrastructure/services/logger.service';

@Injectable()
export class SetCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const cacheItem = new CacheItem(key, value, ttl);
      await this.cacheRepository.set(cacheItem);
      this.logger.log(`Cache set for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error setting cache for key: ${key}`, error.stack);
      throw error;
    }
  }
} 