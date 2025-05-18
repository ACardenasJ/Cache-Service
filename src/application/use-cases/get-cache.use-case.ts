import { Injectable, Inject } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../domain/repositories/cache-repository.token';

@Injectable()
export class GetCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async execute(key: string): Promise<any> {
    const cacheItem = await this.cacheRepository.get(key);
    return cacheItem?.value ?? null;
  }
} 