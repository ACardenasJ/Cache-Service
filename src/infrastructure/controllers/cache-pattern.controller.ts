/* eslint-disable prettier/prettier */
import { Controller, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CacheInvalidationService } from '../services/cache-invalidation.service';

@Controller('cache-patterns')
export class CachePatternController {
  constructor(private readonly cacheInvalidationService: CacheInvalidationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registerPattern(
    @Body() body: { pattern: string; ttl: number },
  ): Promise<{ message: string }> {
    this.cacheInvalidationService.registerInvalidationPattern(body.pattern, body.ttl);
    return { message: `Patrón ${body.pattern} registrado con TTL de ${body.ttl} segundos` };
  }

  @Delete(':pattern')
  async invalidatePattern(
    @Param('pattern') pattern: string,
  ): Promise<{ message: string }> {
    await this.cacheInvalidationService.invalidateByPattern(pattern);
    return { message: `Claves invalidadas para el patrón: ${pattern}` };
  }

  @Delete('key/:key')
  async invalidateKey(
    @Param('key') key: string,
  ): Promise<{ message: string }> {
    await this.cacheInvalidationService.invalidateKey(key);
    return { message: `Clave invalidada: ${key}` };
  }
} 