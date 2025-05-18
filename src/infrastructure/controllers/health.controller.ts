/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '../services/logger.service';
import { HealthCheckUseCase, HealthStatus } from '../../application/use-cases/health-check.use-case';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckUseCase: HealthCheckUseCase,
    private readonly logger: LoggerService
  ) {}

  @Get()
  async healthCheck(): Promise<HealthStatus> {
    this.logger.log('Health check requested', 'HealthController');
    return this.healthCheckUseCase.execute();
  }
} 