import { Injectable, Inject } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { LoggerService } from '../../infrastructure/services/logger.service';

@Injectable()
export class DeleteCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(key: string): Promise<void> {
    try {
      await this.cacheRepository.delete(key);
      this.logger.log(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache for key: ${key}`, error.stack);
      throw error;
    }
  }
} 