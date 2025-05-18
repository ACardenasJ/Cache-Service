/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SetCacheUseCase } from '../../application/use-cases/set-cache.use-case';
import { GetCacheUseCase } from '../../application/use-cases/get-cache.use-case';
import { SetDistributedCacheUseCase } from '../../application/use-cases/set-distributed-cache.use-case';
import { CompareAndSetCacheUseCase } from '../../application/use-cases/compare-and-set-cache.use-case';
import { LoggerService } from '../services/logger.service';

@Controller('cache')
export class CacheController {
  constructor(
    private readonly setCacheUseCase: SetCacheUseCase,
    private readonly getCacheUseCase: GetCacheUseCase,
    private readonly setDistributedCacheUseCase: SetDistributedCacheUseCase,
    private readonly compareAndSetCacheUseCase: CompareAndSetCacheUseCase,
    private readonly logger: LoggerService,
  ) {}

  @Post(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setCache(
    @Param('key') key: string,
    @Body() body: { value: any; ttl?: number },
  ): Promise<void> {
    this.logger.log(`Setting cache for key: ${key}`, 'CacheController');
    await this.setCacheUseCase.execute(key, body.value, body.ttl);
  }

  @Get(':key')
  async getCache(@Param('key') key: string): Promise<any> {
    this.logger.log(`Getting cache for key: ${key}`, 'CacheController');
    return this.getCacheUseCase.execute(key);
  }

  @Post(':key/distributed')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setDistributedCache(
    @Param('key') key: string,
    @Body() body: { value: any; ttl?: number; quorum?: number },
  ): Promise<void> {
    this.logger.log(`Setting distributed cache for key: ${key}`, 'CacheController');
    await this.setDistributedCacheUseCase.execute(
      key,
      body.value,
      body.ttl,
      body.quorum,
    );
  }

  @Post(':key/compare-and-set')
  async compareAndSetCache(
    @Param('key') key: string,
    @Body() body: { value: any; expectedVersion: number },
  ): Promise<{ success: boolean }> {
    this.logger.log(`Attempting compare-and-set for key: ${key}`, 'CacheController');
    const success = await this.compareAndSetCacheUseCase.execute(
      key,
      body.value,
      body.expectedVersion,
    );
    return { success };
  }
} 