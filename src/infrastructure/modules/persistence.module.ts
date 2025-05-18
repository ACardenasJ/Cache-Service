import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from '../services/redis.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IPersistenceService',
      useClass: RedisService,
    },
  ],
  exports: ['IPersistenceService'],
})
export class PersistenceModule {} 