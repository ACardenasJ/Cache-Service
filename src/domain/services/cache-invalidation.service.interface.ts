import { CacheItem } from '../entities/cache-item.entity';

export interface ICacheInvalidationService {
  invalidateCache(key: string): Promise<void>;
  invalidateCachePattern(pattern: string): Promise<void>;
  scheduleInvalidation(item: CacheItem): Promise<void>;
  cancelScheduledInvalidation(key: string): Promise<void>;
} 