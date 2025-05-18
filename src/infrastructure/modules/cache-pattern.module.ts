/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CachePatternController } from '../controllers/cache-pattern.controller';
import { CacheInvalidationService } from '../services/cache-invalidation.service';
import { RedisModule } from './redis.module';
import { CacheModule } from './cache.module';

@Module({
  imports: [
    RedisModule,
    CacheModule
  ],
  controllers: [CachePatternController],
  providers: [CacheInvalidationService],
  exports: [CacheInvalidationService],
})
export class CachePatternModule {} 