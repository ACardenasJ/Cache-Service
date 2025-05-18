/* eslint-disable prettier/prettier */
import { WebSocketGateway as WSGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WSGateway(3001)
export class WebSocketGateway {
  @WebSocketServer()
  server: Server;

  async notifyCacheChange(key: string, value: any) {
    this.server.emit('cacheChange', { key, value });
  }

  async notifyCacheInvalidation(pattern: string) {
    this.server.emit('cacheInvalidation', { pattern });
  }
} 