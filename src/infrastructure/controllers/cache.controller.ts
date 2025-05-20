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
  Put,
} from '@nestjs/common';
import { SetCacheUseCase } from '../../application/use-cases/set-cache.use-case';
import { GetCacheUseCase } from '../../application/use-cases/get-cache.use-case';
import { CompareAndSetCacheUseCase } from '../../application/use-cases/compare-and-set-cache.use-case';
import { DeleteCacheUseCase } from '../../application/use-cases/delete-cache.use-case';
import { ListKeysUseCase } from '../../application/use-cases/list-keys.use-case';
import { DeletePatternUseCase } from '../../application/use-cases/delete-pattern.use-case';
import { LoggerService } from '../services/logger.service';
import { UseLocalCache } from '../decorators/local-cache.decorator';
import { LocalCacheService } from '../services/local-cache.service';

@Controller('cache')
export class CacheController {
  constructor(
    private readonly setCacheUseCase: SetCacheUseCase,
    private readonly getCacheUseCase: GetCacheUseCase,
    private readonly compareAndSetCacheUseCase: CompareAndSetCacheUseCase,
    private readonly deleteCacheUseCase: DeleteCacheUseCase,
    private readonly listKeysUseCase: ListKeysUseCase,
    private readonly deletePatternUseCase: DeletePatternUseCase,
    private readonly logger: LoggerService,
    private readonly localCacheService: LocalCacheService,
  ) {}

  @Post()
  async set(
    @Body('key') key: string,
    @Body('value') value: any,
    @Body('ttl') ttl?: number,
    @Body('quorum') quorum?: number,
  ): Promise<void> {
    this.logger.log(`Setting cache for key: ${key}`, 'CacheController');
    await this.setCacheUseCase.execute(key, value, ttl, quorum);
  }

  @Get(':key')
  @UseLocalCache({ ttl: 30 }) // 30 segundos de caché local
  async get(@Param('key') key: string): Promise<any> {
    this.logger.log(`Getting cache for key: ${key}`, 'CacheController');
    return this.getCacheUseCase.execute(key);
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('key') key: string): Promise<void> {
    this.logger.log(`Deleting cache for key: ${key}`, 'CacheController');
    await this.deleteCacheUseCase.execute(key);
    // También eliminar de la caché local
    this.localCacheService.delete(key);
  }

  @Get('pattern/:pattern')
  async listKeys(@Param('pattern') pattern: string): Promise<string[]> {
    this.logger.log(`Listing keys with pattern: ${pattern}`, 'CacheController');
    return this.listKeysUseCase.execute(pattern);
  }

  @Delete('pattern/:pattern')
  async deletePattern(@Param('pattern') pattern: string): Promise<void> {
    this.logger.log(`Deleting pattern: ${pattern}`, 'CacheController');
    await this.deletePatternUseCase.execute(pattern);
  }

  @Put('compare-and-set/:key')
  async compareAndSet(
    @Param('key') key: string,
    @Body('expectedValue') expectedValue: any,
    @Body('newValue') newValue: any,
    @Body('ttl') ttl?: number,
  ): Promise<boolean> {
    this.logger.log(`Attempting compare-and-set for key: ${key}`, 'CacheController');
    return this.compareAndSetCacheUseCase.execute(key, expectedValue, newValue, ttl);
  }

  // Endpoints para gestión del caché local
  @Delete('local/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLocalCache(@Param('key') key: string): Promise<void> {
    this.logger.log(`Deleting local cache for key: ${key}`, 'CacheController');
    this.localCacheService.delete(key);
  }

  @Delete('local')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearLocalCache(): Promise<void> {
    this.logger.log('Clearing all local cache', 'CacheController');
    this.localCacheService.clear();
  }

  @Get('local/stats')
  async getLocalCacheStats(): Promise<any> {
    this.logger.log('Getting local cache statistics', 'CacheController');
    return this.localCacheService.getStats();
  }
} 