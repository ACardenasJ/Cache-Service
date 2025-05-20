import { Injectable } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { Redis } from 'ioredis';
import { DistributedCacheNode } from '../../domain/entities/distributed-cache-node.entity';

@Injectable()
export class RedisCacheRepository implements ICacheRepository {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async get(key: string): Promise<CacheItem | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    const data = JSON.parse(value);
    return new CacheItem(key, data.value, data.ttl, data.version);
  }

  async set(item: CacheItem): Promise<void> {
    const data = {
      value: item.value,
      ttl: item.ttl,
      version: item.version,
    };
    const stringValue = JSON.stringify(data);
    if (item.ttl) {
      await this.redis.setex(item.key, item.ttl, stringValue);
    } else {
      await this.redis.set(item.key, stringValue);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async ping(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getWithVersion(key: string): Promise<{ item: CacheItem | null; version: number }> {
    const item = await this.get(key);
    return { item, version: item?.version ?? 0 };
  }

  async setWithConsistency(item: CacheItem, quorum?: number): Promise<void> {
    await this.set(item);
  }

  async compareAndSet(key: string, value: any, expectedVersion: number): Promise<boolean> {
    const item = await this.get(key);
    if (!item || item.version !== expectedVersion) {
      return false;
    }
    const newItem = new CacheItem(key, value, item.ttl, expectedVersion + 1);
    await this.set(newItem);
    return true;
  }

  async clear(): Promise<void> {
    await this.redis.flushall();
  }

  async getKeys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async registerNode(node: DistributedCacheNode): Promise<void> {
    await this.redis.hset('nodes', node.nodeId, JSON.stringify(node));
  }

  async unregisterNode(nodeId: string): Promise<void> {
    await this.redis.hdel('nodes', nodeId);
  }

  async getNodes(): Promise<DistributedCacheNode[]> {
    const nodesData = await this.redis.hgetall('nodes');
    return Object.values(nodesData).map(nodeStr => JSON.parse(nodeStr));
  }

  async updateNodeHeartbeat(nodeId: string): Promise<void> {
    const node = await this.redis.hget('nodes', nodeId);
    if (node) {
      const nodeData = JSON.parse(node);
      nodeData.lastHeartbeat = new Date();
      await this.redis.hset('nodes', nodeId, JSON.stringify(nodeData));
    }
  }

  async replicateToNode(nodeId: string, item: CacheItem): Promise<void> {
    // Implementación básica - en un caso real, esto se comunicaría con el nodo destino
    await this.set(item);
  }

  async syncFromNode(nodeId: string): Promise<void> {
    // Implementación básica - en un caso real, esto sincronizaría con el nodo origen
    // Por ahora, simplemente retornamos
  }
} 