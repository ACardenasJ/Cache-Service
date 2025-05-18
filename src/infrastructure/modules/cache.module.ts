/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SetCacheUseCase } from '../../application/use-cases/set-cache.use-case';
import { GetCacheUseCase } from '../../application/use-cases/get-cache.use-case';
import { SetDistributedCacheUseCase } from '../../application/use-cases/set-distributed-cache.use-case';
import { CompareAndSetCacheUseCase } from '../../application/use-cases/compare-and-set-cache.use-case';
import { MemoryCacheRepository } from '../repositories/memory-cache.repository';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { ConsensusService } from '../services/consensus.service';
import { RedisModule } from './redis.module';
import { CacheController } from '../controllers/cache.controller';

@Module({
  imports: [RedisModule],
  controllers: [CacheController],
  providers: [
    SetCacheUseCase,
    GetCacheUseCase,
    SetDistributedCacheUseCase,
    CompareAndSetCacheUseCase,
    ConsensusService,
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
    CACHE_REPOSITORY,
    ConsensusService,
  ],
})
export class CacheModule {} 