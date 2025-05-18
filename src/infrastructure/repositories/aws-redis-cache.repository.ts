/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { DistributedCacheNode } from '../../domain/entities/distributed-cache-node.entity';
import { ConsensusService } from '../services/consensus.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as tls from 'tls';

@Injectable()
export class AWSRedisCacheRepository implements ICacheRepository {
  private readonly logger = new Logger(AWSRedisCacheRepository.name);
  private readonly redis: Redis;

  constructor(
    private readonly consensusService: ConsensusService,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('AWS_ELASTICACHE_ENDPOINT'),
      port: this.configService.get<number>('AWS_ELASTICACHE_PORT', 6379),
      password: this.configService.get<string>('AWS_ELASTICACHE_AUTH_TOKEN'),
      tls: {
        // Configuración TLS básica para AWS ElastiCache
        rejectUnauthorized: false
      },
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redis.on('error', (err) => {
      this.logger.error(`Redis AWS Error: ${err.message}`);
    });

    this.redis.on('connect', () => {
      this.logger.log('Conectado a Redis AWS ElastiCache');
    });
  }

  async set(item: CacheItem): Promise<void> {
    try {
      const serializedItem = JSON.stringify({
        ...item,
        lastModified: item.lastModified.toISOString(),
      });

      if (item.ttl) {
        await this.redis.set(item.key, serializedItem, 'EX', item.ttl);
      } else {
        await this.redis.set(item.key, serializedItem);
      }

      await this.consensusService.incrementVersion(item.key);
    } catch (error) {
      this.logger.error(`Error al guardar en Redis AWS: ${error.message}`);
      throw error;
    }
  }

  async get(key: string): Promise<CacheItem | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      const item = new CacheItem(
        parsed.key,
        parsed.value,
        parsed.ttl,
        parsed.version,
        new Date(parsed.lastModified),
        parsed.nodeId
      );

      if (item.isExpired()) {
        await this.delete(key);
        return null;
      }

      return item;
    } catch (error) {
      this.logger.error(`Error al obtener de Redis AWS: ${error.message}`);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      await this.consensusService.releaseLock(key);
    } catch (error) {
      this.logger.error(`Error al eliminar de Redis AWS: ${error.message}`);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      this.logger.error(`Error al limpiar Redis AWS: ${error.message}`);
      throw error;
    }
  }

  async setWithConsistency(item: CacheItem, quorum: number = 1): Promise<void> {
    const nodes = await this.getNodes();
    
    if (nodes.length === 0) {
      await this.set(item);
      return;
    }

    const isValid = await this.consensusService.validateWrite(nodes, item);
    if (!isValid) {
      throw new Error('No se pudo alcanzar consenso para la escritura');
    }

    const newItem = new CacheItem(
      item.key,
      item.value,
      item.ttl,
      item.version,
      new Date(),
      'aws-redis'
    );

    await this.set(newItem);

    let successCount = 1;
    for (const node of nodes) {
      try {
        await this.replicateToNode(node.nodeId, newItem);
        successCount++;
        if (successCount >= quorum) break;
      } catch (error) {
        this.logger.error(`Error al replicar a nodo ${node.nodeId}: ${error.message}`);
      }
    }

    if (successCount < quorum && successCount === 1) {
      this.logger.warn('No se alcanzó el quórum completo. Solo se guardó en Redis AWS.');
      return;
    }

    if (successCount < quorum) {
      throw new Error('No se pudo alcanzar el quórum requerido');
    }
  }

  async compareAndSet(key: string, value: any, expectedVersion: number): Promise<boolean> {
    const hasVersion = await this.consensusService.checkVersion(key, expectedVersion);
    if (!hasVersion) return false;

    const locked = await this.consensusService.acquireLock(key);
    if (!locked) return false;

    try {
      const item = new CacheItem(key, value, undefined, expectedVersion + 1);
      await this.set(item);
      return true;
    } finally {
      await this.consensusService.releaseLock(key);
    }
  }

  async getWithVersion(key: string): Promise<{ item: CacheItem | null; version: number }> {
    const nodes = await this.getNodes();
    
    const resolvedItem = await this.consensusService.resolveConflicts(nodes, key);
    if (resolvedItem) {
      await this.set(resolvedItem);
      return { item: resolvedItem, version: resolvedItem.version };
    }

    const item = await this.get(key);
    return { item, version: item?.version ?? 0 };
  }

  // Métodos de gestión de nodos
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
    const nodeData = await this.redis.hget('nodes', nodeId);
    if (nodeData) {
      const node = JSON.parse(nodeData);
      node.lastHeartbeat = new Date();
      await this.redis.hset('nodes', nodeId, JSON.stringify(node));
    }
  }

  async replicateToNode(nodeId: string, item: CacheItem): Promise<void> {
    const nodeData = await this.redis.hget('nodes', nodeId);
    if (!nodeData) {
      throw new Error(`Nodo no encontrado: ${nodeId}`);
    }
    // La replicación real ocurriría aquí
    this.logger.debug(`Replicando datos al nodo: ${nodeId}`);
  }

  async syncFromNode(nodeId: string): Promise<void> {
    const nodeData = await this.redis.hget('nodes', nodeId);
    if (!nodeData) {
      throw new Error(`Nodo no encontrado: ${nodeId}`);
    }
    // La sincronización real ocurriría aquí
    this.logger.debug(`Sincronizando datos desde el nodo: ${nodeId}`);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
} 