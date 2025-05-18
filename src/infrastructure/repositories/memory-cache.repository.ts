/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { ICacheRepository } from '../../domain/repositories/cache-repository.interface';
import { DistributedCacheNode } from '../../domain/entities/distributed-cache-node.entity';
import { v4 as uuidv4 } from 'uuid';
import { ConsensusService } from '../services/consensus.service';

/**
 * Implementación en memoria del repositorio de caché distribuido.
 * Utiliza un enfoque de consistencia eventual con quórum configurable.
 */
@Injectable()
export class MemoryCacheRepository implements ICacheRepository {
  private readonly logger = new Logger(MemoryCacheRepository.name);
  private cache: Map<string, CacheItem> = new Map();
  private nodes: Map<string, DistributedCacheNode> = new Map();
  private readonly nodeId: string;
  private cleanupInterval: NodeJS.Timeout;

  constructor(private readonly consensusService: ConsensusService) {
    this.nodeId = uuidv4();
    this.logger.log(`Iniciando nodo de caché con ID: ${this.nodeId}`);
    this.startCleanupTask();
  }

  async set(item: CacheItem): Promise<void> {
    this.cache.set(item.key, item);
    await this.consensusService.incrementVersion(item.key);
  }

  async get(key: string): Promise<CacheItem | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.isExpired()) {
      this.cache.delete(key);
      return null;
    }
    return item;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    await this.consensusService.releaseLock(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.logger.debug('Caché limpiada');
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

  // Operaciones distribuidas
  async setWithConsistency(item: CacheItem, quorum: number = 1): Promise<void> {
    const nodes = Array.from(this.nodes.values());
    
    // Si no hay otros nodos, procedemos con la escritura local
    if (nodes.length === 0) {
      await this.set(item);
      return;
    }
    
    // Validar la escritura con el servicio de consenso
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
      this.nodeId
    );

    await this.set(newItem);
    
    // Si solo hay un nodo (nosotros mismos), no necesitamos replicar
    if (nodes.length === 0) {
      return;
    }

    // Replicar a otros nodos
    let successCount = 1; // Contamos nuestro nodo como exitoso
    for (const node of nodes) {
      try {
        await this.replicateToNode(node.nodeId, newItem);
        successCount++;
        if (successCount >= quorum) break;
      } catch (error) {
        this.logger.error(`Error al replicar a nodo ${node.nodeId}: ${error.message}`);
      }
    }

    // Si no alcanzamos el quórum pero al menos pudimos escribir localmente
    if (successCount < quorum && successCount === 1) {
      this.logger.warn(`No se alcanzó el quórum completo. Solo se guardó localmente.`);
      return;
    }

    if (successCount < quorum) {
      throw new Error('No se pudo alcanzar el quórum requerido');
    }
  }

  async getWithVersion(key: string): Promise<{ item: CacheItem | null; version: number }> {
    const nodes = Array.from(this.nodes.values());
    
    // Intentar resolver conflictos entre nodos
    const resolvedItem = await this.consensusService.resolveConflicts(nodes, key);
    if (resolvedItem) {
      // Actualizar la caché local con la versión resuelta
      await this.set(resolvedItem);
      return { item: resolvedItem, version: resolvedItem.version };
    }

    // Si no hay conflictos, usar la versión local
    const item = await this.get(key);
    return { item, version: item?.version ?? 0 };
  }

  // Gestión de nodos
  async registerNode(node: DistributedCacheNode): Promise<void> {
    this.nodes.set(node.nodeId, node);
    this.logger.log(`Nodo registrado: ${node.nodeId}`);
  }

  async unregisterNode(nodeId: string): Promise<void> {
    this.nodes.delete(nodeId);
    this.logger.log(`Nodo eliminado: ${nodeId}`);
  }

  async getNodes(): Promise<DistributedCacheNode[]> {
    return Array.from(this.nodes.values());
  }

  async updateNodeHeartbeat(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      this.nodes.set(nodeId, {
        ...node,
        lastHeartbeat: new Date()
      });
    }
  }

  // Replicación
  async replicateToNode(nodeId: string, item: CacheItem): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Nodo no encontrado: ${nodeId}`);
    }
    // Aquí iría la lógica real de replicación
    this.logger.debug(`Replicando datos al nodo: ${nodeId}`);
  }

  async syncFromNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Nodo no encontrado: ${nodeId}`);
    }
    // Aquí iría la lógica real de sincronización
    this.logger.debug(`Sincronizando datos desde el nodo: ${nodeId}`);
  }

  private startCleanupTask() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (item.isExpired()) {
          this.cache.delete(key);
          this.logger.debug('Caché limpiada');
        }
      }
    }, 5000);
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
} 