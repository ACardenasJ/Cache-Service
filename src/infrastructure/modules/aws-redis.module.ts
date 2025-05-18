/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AWSRedisCacheRepository } from '../repositories/aws-redis-cache.repository';
import { ConsensusService } from '../services/consensus.service';

@Module({
  imports: [ConfigModule],
  providers: [
    AWSRedisCacheRepository,
    ConsensusService,
  ],
  exports: [AWSRedisCacheRepository],
})
export class AWSRedisModule {} 