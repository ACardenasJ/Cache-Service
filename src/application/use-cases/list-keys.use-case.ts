import { Injectable, Inject } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { LoggerService } from '../../infrastructure/services/logger.service';

@Injectable()
export class ListKeysUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(pattern: string): Promise<string[]> {
    try {
      const keys = await this.cacheRepository.getKeys(pattern);
      this.logger.log(`Listed keys with pattern: ${pattern}`);
      return keys;
    } catch (error) {
      this.logger.error(`Error listing keys with pattern: ${pattern}`, error.stack);
      throw error;
    }
  }
} 