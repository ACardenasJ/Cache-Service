import { DistributedCacheNode } from '../entities/distributed-cache-node.entity';
import { CacheItem } from '../entities/cache-item.entity';

export interface IConsensusService {
  validateWrite(nodes: DistributedCacheNode[], item: CacheItem): Promise<boolean>;
  acquireLock(key: string, ttl?: number): Promise<boolean>;
  releaseLock(key: string): Promise<void>;
  checkVersion(key: string, version: number): Promise<boolean>;
  incrementVersion(key: string): Promise<number>;
} 