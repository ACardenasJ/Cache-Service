import { Injectable, Inject } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { LoggerService } from '../../infrastructure/services/logger.service';

@Injectable()
export class DeletePatternUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(pattern: string): Promise<void> {
    try {
      const keys = await this.cacheRepository.getKeys(pattern);
      await Promise.all(keys.map(key => this.cacheRepository.delete(key)));
      this.logger.log(`Deleted pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error deleting pattern: ${pattern}`, error.stack);
      throw error;
    }
  }
} 