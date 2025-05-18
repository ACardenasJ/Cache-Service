import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckUseCase } from '../../../src/application/use-cases/health-check.use-case';
import { ICacheRepository } from '../../../src/domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../../src/domain/repositories/cache-repository.token';
import { LoggerService } from '../../../src/infrastructure/services/logger.service';

describe('HealthCheckUseCase', () => {
  let useCase: HealthCheckUseCase;
  let cacheRepository: ICacheRepository;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckUseCase,
        {
          provide: CACHE_REPOSITORY,
          useValue: {
            ping: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<HealthCheckUseCase>(HealthCheckUseCase);
    cacheRepository = module.get<ICacheRepository>(CACHE_REPOSITORY);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return healthy status when all services are up', async () => {
      jest.spyOn(cacheRepository, 'ping').mockResolvedValue(true);

      const result = await useCase.execute();
      
      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        redis: 'connected',
        version: expect.any(String)
      });
      expect(cacheRepository.ping).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith('Health check executed successfully');
    });

    it('should return unhealthy status when Redis is down', async () => {
      jest.spyOn(cacheRepository, 'ping').mockResolvedValue(false);

      const result = await useCase.execute();
      
      expect(result).toEqual({
        status: 'error',
        timestamp: expect.any(String),
        redis: 'disconnected',
        version: expect.any(String)
      });
      expect(loggerService.error).toHaveBeenCalledWith('Redis health check failed');
    });

    it('should handle Redis connection errors', async () => {
      const error = new Error('Redis connection error');
      jest.spyOn(cacheRepository, 'ping').mockRejectedValue(error);

      const result = await useCase.execute();
      
      expect(result).toEqual({
        status: 'error',
        timestamp: expect.any(String),
        redis: 'error',
        version: expect.any(String)
      });
      expect(loggerService.error).toHaveBeenCalledWith('Redis health check error', error.stack);
    });
  });
}); 