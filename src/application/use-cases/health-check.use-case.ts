/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { LoggerService } from '../../infrastructure/services/logger.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  redis: 'connected' | 'disconnected' | 'error';
  version: string;
}

@Injectable()
export class HealthCheckUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(): Promise<HealthStatus> {
    try {
      const isRedisConnected = await this.cacheRepository.ping();
      
      if (!isRedisConnected) {
        this.logger.error('Redis health check failed');
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          redis: 'disconnected',
          version: process.env.npm_package_version || '1.0.0'
        };
      }

      this.logger.log('Health check executed successfully');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: 'connected',
        version: process.env.npm_package_version || '1.0.0'
      };
    } catch (error) {
      this.logger.error('Redis health check error', error.stack);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        redis: 'error',
        version: process.env.npm_package_version || '1.0.0'
      };
    }
  }
} 