/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/websocket.gateway';

@Module({
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {} 