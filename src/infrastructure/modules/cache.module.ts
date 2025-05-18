/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SetCacheUseCase } from '../../application/use-cases/set-cache.use-case';
import { GetCacheUseCase } from '../../application/use-cases/get-cache.use-case';
import { SetDistributedCacheUseCase } from '../../application/use-cases/set-distributed-cache.use-case';
import { CompareAndSetCacheUseCase } from '../../application/use-cases/compare-and-set-cache.use-case';
import { DeleteCacheUseCase } from '../../application/use-cases/delete-cache.use-case';
import { ListKeysUseCase } from '../../application/use-cases/list-keys.use-case';
import { MemoryCacheRepository } from '../repositories/memory-cache.repository';
import { ConsensusService } from '../services/consensus.service';
import { RedisModule } from './redis.module';
import { CacheController } from '../controllers/cache.controller';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { LoggerService } from '../services/logger.service';

@Module({
  imports: [RedisModule],
  controllers: [CacheController],
  providers: [
    SetCacheUseCase,
    GetCacheUseCase,
    SetDistributedCacheUseCase,
    CompareAndSetCacheUseCase,
    DeleteCacheUseCase,
    ListKeysUseCase,
    ConsensusService,
    LoggerService,
    {
      provide: CACHE_REPOSITORY,
      useClass: MemoryCacheRepository,
    },
  ],
  exports: [
    SetCacheUseCase,
    GetCacheUseCase,
    SetDistributedCacheUseCase,
    CompareAndSetCacheUseCase,
    DeleteCacheUseCase,
    ListKeysUseCase,
    ConsensusService,
    LoggerService,
    CACHE_REPOSITORY,
  ],
})
export class CacheModule {} 