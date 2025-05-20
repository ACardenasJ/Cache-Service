/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CachePatternController } from '../controllers/cache-pattern.controller';
import { CacheInvalidationService } from '../services/cache-invalidation.service';
import { RedisService } from '../services/redis.service';
import { CacheModule } from './cache.module';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';
import { RedisCacheRepository } from '../repositories/redis-cache.repository';

@Module({
  imports: [CacheModule],
  controllers: [CachePatternController],
  providers: [
    {
      provide: CACHE_REPOSITORY,
      useClass: RedisCacheRepository,
    },
    CacheInvalidationService,
    RedisService,
  ],
  exports: [CacheInvalidationService],
})
export class CachePatternModule {} 