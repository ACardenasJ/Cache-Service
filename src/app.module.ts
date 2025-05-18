/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './infrastructure/modules/cache.module';
import { RedisModule } from './infrastructure/modules/redis.module';
import { HealthController } from './infrastructure/controllers/health.controller';
import { LoggerModule } from './infrastructure/modules/logger.module';
import { CachePatternModule } from './infrastructure/modules/cache-pattern.module';

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
})
export class AppModule {}
