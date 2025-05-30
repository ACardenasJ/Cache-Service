import { Injectable, Inject } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { LoggerService } from '../../infrastructure/services/logger.service';

@Injectable()
export class GetCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(key: string): Promise<any> {
    try {
      const cacheItem = await this.cacheRepository.get(key);
      
      if (cacheItem) {
        this.logger.log(`Cache hit for key: ${key}`);
        return cacheItem.value;
      } else {
        this.logger.log(`Cache miss for key: ${key}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error getting cache for key: ${key}`, error.stack);
      throw error;
    }
  }
} 