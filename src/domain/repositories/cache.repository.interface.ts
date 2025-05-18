import { CacheItem } from '../entities/cache-item.entity';

export interface CacheRepository {
  get(key: string): Promise<CacheItem | null>;
  set(item: CacheItem): Promise<void>;
  delete(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  ping(): Promise<boolean>;
  getWithVersion?(key: string): Promise<{ value: string; version: number } | null>;
  setWithConsistency?(item: CacheItem, quorum?: number): Promise<void>;
  compareAndSet?(key: string, value: string, expectedVersion: number): Promise<boolean>;
} 