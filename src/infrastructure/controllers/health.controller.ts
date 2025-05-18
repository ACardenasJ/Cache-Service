/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '../services/logger.service';

@Controller('health')
export class HealthController {
  constructor(private readonly logger: LoggerService) {}

  @Get()
  healthCheck() {
    this.logger.log('Health check requested', 'HealthController');
    return {
      status: 'Ok',
      timestamp: new Date().toISOString(),
      service: 'cache-service'
    };
  }
} 