/* eslint-disable prettier/prettier */
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DistributedCacheNode } from '../../domain/entities/distributed-cache-node.entity';
import { CacheItem } from '../../domain/entities/cache-item.entity';
import { IConsensusService } from '../../domain/services/consensus.service.interface';
import * as WebSocket from 'ws';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

interface NodeConnection {
  ws: WebSocket;
  lastHeartbeat: Date;
  isConnected: boolean;
}

@Injectable()
export class ConsensusService implements IConsensusService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsensusService.name);
  private readonly writeQuorum = 0.51; // Más del 50% de los nodos deben confirmar
  private readonly readQuorum = 0.51;  // Más del 50% de los nodos deben responder
  private readonly nodeConnections = new Map<string, NodeConnection>();
  private readonly vectorClocks = new Map<string, Map<string, number>>();
  private wss: WebSocket.Server;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    await this.initializeWebSocketServer();
    this.startHeartbeatMonitoring();
  }

  async onModuleDestroy() {
    if (this.wss) {
      this.wss.close();
    }
  }

  private async initializeWebSocketServer() {
    const wsPort = this.configService.get<number>('WS_PORT', 3002);
    
    try {
      this.wss = new WebSocket.Server({ port: wsPort });
      this.logger.log(`WebSocket server started on port ${wsPort}`);

      this.wss.on('connection', (ws: WebSocket) => {
        const nodeId = Math.random().toString(36).substring(7);
        this.nodeConnections.set(nodeId, { 
          ws, 
          lastHeartbeat: new Date(), 
          isConnected: true 
        });

        ws.on('message', (message: string) => this.handleNodeMessage(nodeId, message));
        ws.on('close', () => this.handleNodeDisconnection(nodeId));
        ws.on('error', (error) => {
          this.logger.error(`WebSocket error for node ${nodeId}: ${error.message}`);
          this.handleNodeDisconnection(nodeId);
        });
      });

      this.wss.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          this.logger.error(`Port ${wsPort} is already in use. Please configure a different port in the environment variables.`);
        } else {
          this.logger.error(`WebSocket server error: ${error.message}`);
        }
      });

    } catch (error) {
      this.logger.error(`Failed to initialize WebSocket server: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        this.logger.error(`Port ${wsPort} is already in use. Please configure a different port in the environment variables.`);
      }
      throw error;
    }
  }

  private startHeartbeatMonitoring() {
    setInterval(() => {
      this.checkNodesHealth();
      this.sendHeartbeats();
    }, 5000);
  }

  private async checkNodesHealth() {
    const now = Date.now();
    const heartbeatThreshold = 30000; // 30 segundos

    for (const [nodeId, connection] of this.nodeConnections.entries()) {
      if (connection.isConnected && 
          now - connection.lastHeartbeat.getTime() > heartbeatThreshold) {
        this.logger.warn(`Nodo ${nodeId} no responde, marcando como inactivo`);
        connection.isConnected = false;
        this.attemptReconnection(nodeId);
      }
    }
  }

  private async attemptReconnection(nodeId: string) {
    const maxRetries = 3;
    let retries = 0;

    const tryReconnect = async () => {
      try {
        const connection = this.nodeConnections.get(nodeId);
        if (connection && !connection.isConnected && retries < maxRetries) {
          this.logger.log(`Intento de reconexión ${retries + 1} para nodo ${nodeId}`);
          const wsPort = this.configService.get<number>('WS_PORT', 3001);
          const ws = new WebSocket(`ws://localhost:${wsPort}`);
          
          ws.on('open', () => {
            connection.ws = ws;
            connection.isConnected = true;
            connection.lastHeartbeat = new Date();
            this.logger.log(`Reconexión exitosa para nodo ${nodeId}`);
          });

          ws.on('error', () => {
            retries++;
            if (retries < maxRetries) {
              setTimeout(tryReconnect, 5000);
            }
          });
        }
      } catch (error) {
        this.logger.error(`Error en reconexión de nodo ${nodeId}: ${error.message}`);
      }
    };

    await tryReconnect();
  }

  private sendHeartbeats() {
    for (const [nodeId, connection] of this.nodeConnections.entries()) {
      if (connection.isConnected) {
        try {
          connection.ws.send(JSON.stringify({ type: 'heartbeat' }));
        } catch (error) {
          this.logger.error(`Error enviando heartbeat a nodo ${nodeId}`);
          connection.isConnected = false;
        }
      }
    }
  }

  private handleNodeMessage(nodeId: string, message: string) {
    try {
      const data = JSON.parse(message);
      const connection = this.nodeConnections.get(nodeId);
      
      if (connection) {
        connection.lastHeartbeat = new Date();
        
        switch (data.type) {
          case 'heartbeat':
            break;
          case 'replication':
            this.handleReplication(nodeId, data.item);
            break;
          case 'version_check':
            this.handleVersionCheck(nodeId, data.key);
            break;
          case 'version_update':
            this.handleVersionUpdate(data.key, data.version);
            break;
          default:
            this.logger.warn(`Tipo de mensaje desconocido: ${data.type}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error procesando mensaje de nodo ${nodeId}: ${error.message}`);
    }
  }

  private handleNodeDisconnection(nodeId: string) {
    const connection = this.nodeConnections.get(nodeId);
    if (connection) {
      connection.isConnected = false;
      this.logger.warn(`Nodo ${nodeId} desconectado`);
      this.attemptReconnection(nodeId);
    }
  }

  async validateWrite(nodes: DistributedCacheNode[], item: CacheItem): Promise<boolean> {
    const activeNodes = Array.from(this.nodeConnections.values())
      .filter(conn => conn.isConnected);
    
    const requiredNodes = Math.ceil(activeNodes.length * this.writeQuorum);
    let confirmedNodes = 0;

    const writePromises = activeNodes.map(async (connection) => {
      try {
        await this.sendToNode(connection.ws, {
          type: 'replication',
          item
        });
        confirmedNodes++;
        return true;
      } catch (error) {
        return false;
      }
    });

    await Promise.all(writePromises);
    return confirmedNodes >= requiredNodes;
  }

  private async sendToNode(ws: WebSocket, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        ws.send(JSON.stringify(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReplication(nodeId: string, item: CacheItem) {
    this.logger.log(`Replicación recibida del nodo ${nodeId} para clave ${item.key}`);
    this.broadcastToOtherNodes(nodeId, {
      type: 'replication_confirm',
      key: item.key,
      version: item.version
    });
  }

  private handleVersionCheck(nodeId: string, key: string) {
    const clock = this.vectorClocks.get(key);
    const connection = this.nodeConnections.get(nodeId);
    
    if (connection?.isConnected && clock) {
      connection.ws.send(JSON.stringify({
        type: 'version_response',
        key,
        version: clock.get('current') || 0
      }));
    }
  }

  private handleVersionUpdate(key: string, version: number) {
    let clock = this.vectorClocks.get(key);
    if (!clock) {
      clock = new Map<string, number>();
      this.vectorClocks.set(key, clock);
    }
    clock.set('current', version);
  }

  private broadcastToOtherNodes(excludeNodeId: string, message: any) {
    for (const [nodeId, connection] of this.nodeConnections.entries()) {
      if (nodeId !== excludeNodeId && connection.isConnected) {
        try {
          connection.ws.send(JSON.stringify(message));
        } catch (error) {
          this.logger.error(`Error broadcasting a nodo ${nodeId}`);
        }
      }
    }
  }

  async acquireLock(key: string, ttl: number = 10): Promise<boolean> {
    try {
      return await this.redisService.set(`lock:${key}`, Date.now(), ttl);
    } catch {
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    await this.redisService.del(`lock:${key}`);
  }

  async checkVersion(key: string, version: number): Promise<boolean> {
    const clock = this.vectorClocks.get(key);
    return (clock?.get('current') || 0) === version;
  }

  async incrementVersion(key: string): Promise<number> {
    let clock = this.vectorClocks.get(key);
    if (!clock) {
      clock = new Map<string, number>();
      this.vectorClocks.set(key, clock);
    }

    const currentVersion = clock.get('current') || 0;
    const newVersion = currentVersion + 1;
    clock.set('current', newVersion);

    this.broadcastToOtherNodes('', {
      type: 'version_update',
      key,
      version: newVersion
    });

    return newVersion;
  }

  async resolveConflicts(nodes: DistributedCacheNode[], key: string): Promise<CacheItem | null> {
    try {
      const versions = new Map<string, number>();
      let latestItem: CacheItem | null = null;
      let maxVersion = -1;

      interface VersionResponse {
        type: 'version_response';
        key: string;
        version: number;
        item: CacheItem;
      }

      // Recolectar versiones de todos los nodos
      for (const node of nodes) {
        const connection = this.nodeConnections.get(node.nodeId);
        if (connection?.isConnected) {
          try {
            const response = await new Promise<VersionResponse>((resolve, reject) => {
              connection.ws.send(JSON.stringify({
                type: 'version_check',
                key
              }));

              const timeout = setTimeout(() => {
                reject(new Error('Version check timeout'));
              }, 5000);

              connection.ws.once('message', (data) => {
                clearTimeout(timeout);
                try {
                  const parsed = JSON.parse(data.toString());
                  if (parsed.type === 'version_response' && parsed.key === key) {
                    resolve(parsed as VersionResponse);
                  } else {
                    reject(new Error('Invalid response type'));
                  }
                } catch (error) {
                  reject(error);
                }
              });
            });

            versions.set(node.nodeId, response.version);
            if (response.version > maxVersion) {
              maxVersion = response.version;
              latestItem = response.item;
            }
          } catch (error) {
            this.logger.error(`Error checking version on node ${node.nodeId}: ${error.message}`);
          }
        }
      }

      // Si no hay conflictos, retornar el item más reciente
      if (latestItem) {
        return latestItem;
      }

      this.logger.warn(`No consensus reached for key ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Error resolving conflicts for key ${key}: ${error.message}`);
      return null;
    }
  }
} 