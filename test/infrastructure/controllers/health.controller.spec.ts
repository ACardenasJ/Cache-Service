/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../../src/infrastructure/controllers/health.controller';
import { HealthCheckUseCase, HealthStatus } from '../../../src/application/use-cases/health-check.use-case';
import { LoggerService } from '../../../src/infrastructure/services/logger.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckUseCase: HealthCheckUseCase;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckUseCase = module.get<HealthCheckUseCase>(HealthCheckUseCase);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const healthStatus: HealthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: 'connected',
        version: '1.0.0'
      };
      jest.spyOn(healthCheckUseCase, 'execute').mockResolvedValue(healthStatus);

      const result = await controller.healthCheck();
      expect(result).toEqual(healthStatus);
      expect(healthCheckUseCase.execute).toHaveBeenCalled();
    });

    it('should handle health check errors', async () => {
      const error = new Error('Health check failed');
      jest.spyOn(healthCheckUseCase, 'execute').mockRejectedValue(error);

      await expect(controller.healthCheck()).rejects.toThrow(error);
    });
  });
}); 