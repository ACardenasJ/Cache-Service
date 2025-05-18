/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './infrastructure/modules/cache.module';
import { RedisModule } from './infrastructure/modules/redis.module';
import { HealthController } from './infrastructure/controllers/health.controller';
import { LoggerModule } from './infrastructure/modules/logger.module';
import { CachePatternModule } from './infrastructure/modules/cache-pattern.module';
import { HealthCheckUseCase } from './application/use-cases/health-check.use-case';
import { MemoryCacheRepository } from './infrastructure/repositories/memory-cache.repository';
import { ConsensusService } from './infrastructure/services/consensus.service';
import { CACHE_REPOSITORY } from './domain/repositories/cache-repository.token';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    RedisModule,
    LoggerModule,
    CachePatternModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthCheckUseCase,
    ConsensusService,
    {
      provide: CACHE_REPOSITORY,
      useClass: MemoryCacheRepository,
    }
  ],
})
export class AppModule {}
