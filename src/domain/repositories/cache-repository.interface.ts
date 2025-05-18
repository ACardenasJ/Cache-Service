/* eslint-disable prettier/prettier */
import { CacheItem } from '../entities/cache-item.entity';
import { DistributedCacheNode } from '../entities/distributed-cache-node.entity';

/**
 * Interfaz que define las operaciones del repositorio de caché distribuido.
 * Implementa patrones de consistencia eventual y quórum configurable.
 */
export interface ICacheRepository {
  /**
   * Operaciones básicas de caché
   */

  /**
   * Almacena un item en el caché.
   * @param item Item a almacenar con su clave, valor y TTL opcional
   */
  set(item: CacheItem): Promise<void>;

  /**
   * Recupera un item del caché por su clave.
   * @param key Clave del item a recuperar
   * @returns El item si existe y no ha expirado, null en caso contrario
   */
  get(key: string): Promise<CacheItem | null>;

  /**
   * Elimina un item del caché.
   * @param key Clave del item a eliminar
   */
  delete(key: string): Promise<void>;

  /**
   * Limpia todo el caché.
   */
  clear(): Promise<void>;

  /**
   * Operaciones distribuidas
   */

  /**
   * Almacena un item con garantía de consistencia mediante quórum.
   * @param item Item a almacenar
   * @param quorum Número mínimo de nodos que deben confirmar la escritura
   */
  setWithConsistency(item: CacheItem, quorum?: number): Promise<void>;

  /**
   * Recupera un item junto con su versión para control de concurrencia.
   * @param key Clave del item
   * @returns El item y su versión actual
   */
  getWithVersion(key: string): Promise<{ item: CacheItem | null; version: number }>;

  /**
   * Actualiza un item solo si su versión coincide con la esperada.
   * @param key Clave del item
   * @param value Nuevo valor
   * @param expectedVersion Versión esperada
   * @returns true si se actualizó correctamente, false si la versión no coincide
   */
  compareAndSet(key: string, value: any, expectedVersion: number): Promise<boolean>;
  
  /**
   * Gestión de nodos
   */

  /**
   * Registra un nuevo nodo en el cluster.
   * @param node Información del nodo
   */
  registerNode(node: DistributedCacheNode): Promise<void>;

  /**
   * Elimina un nodo del cluster.
   * @param nodeId ID del nodo a eliminar
   */
  unregisterNode(nodeId: string): Promise<void>;

  /**
   * Obtiene la lista de nodos activos.
   */
  getNodes(): Promise<DistributedCacheNode[]>;

  /**
   * Actualiza el heartbeat de un nodo.
   * @param nodeId ID del nodo
   */
  updateNodeHeartbeat(nodeId: string): Promise<void>;
  
  /**
   * Replicación
   */

  /**
   * Replica un item a un nodo específico.
   * @param nodeId ID del nodo destino
   * @param item Item a replicar
   */
  replicateToNode(nodeId: string, item: CacheItem): Promise<void>;

  /**
   * Sincroniza el estado desde un nodo específico.
   * @param nodeId ID del nodo origen
   */
  syncFromNode(nodeId: string): Promise<void>;
} 