/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CacheController } from '../controllers/cache.controller';
import { GetCacheUseCase } from '../../application/use-cases/get-cache.use-case';
import { SetCacheUseCase } from '../../application/use-cases/set-cache.use-case';
import { DeleteCacheUseCase } from '../../application/use-cases/delete-cache.use-case';
import { ListKeysUseCase } from '../../application/use-cases/list-keys.use-case';
import { DeletePatternUseCase } from '../../application/use-cases/delete-pattern.use-case';
import { CompareAndSetCacheUseCase } from '../../application/use-cases/compare-and-set-cache.use-case';
import { HealthCheckUseCase } from '../../application/use-cases/health-check.use-case';
import { LoggerService } from '../services/logger.service';
import { LocalCacheService } from '../services/local-cache.service';
import { RedisModule } from './redis.module';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { RedisCacheRepository } from '../repositories/redis-cache.repository';

@Module({
  imports: [RedisModule],
  controllers: [CacheController],
  providers: [
    {
      provide: CACHE_REPOSITORY,
      useClass: RedisCacheRepository,
    },
    GetCacheUseCase,
    SetCacheUseCase,
    DeleteCacheUseCase,
    ListKeysUseCase,
    DeletePatternUseCase,
    CompareAndSetCacheUseCase,
    HealthCheckUseCase,
    LoggerService,
    LocalCacheService,
  ],
  exports: [
    GetCacheUseCase,
    SetCacheUseCase,
    DeleteCacheUseCase,
    ListKeysUseCase,
    DeletePatternUseCase,
    CompareAndSetCacheUseCase,
    HealthCheckUseCase,
  ],
})
export class CacheModule {} 