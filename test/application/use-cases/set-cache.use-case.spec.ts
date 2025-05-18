import { Test, TestingModule } from '@nestjs/testing';
import { SetCacheUseCase } from '../../../src/application/use-cases/set-cache.use-case';
import { ICacheRepository } from '../../../src/domain/repositories/cache-repository.interface';
import { LoggerService } from '../../../src/infrastructure/services/logger.service';
import { CacheItem } from '../../../src/domain/entities/cache-item.entity';
import { CACHE_REPOSITORY } from '../../../src/domain/repositories/cache-repository.token';

describe('SetCacheUseCase', () => {
  let useCase: SetCacheUseCase;
  let cacheRepository: ICacheRepository;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetCacheUseCase,
        {
          provide: CACHE_REPOSITORY,
          useValue: {
            set: jest.fn(),
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

    useCase = module.get<SetCacheUseCase>(SetCacheUseCase);
    cacheRepository = module.get<ICacheRepository>(CACHE_REPOSITORY);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should set cache value successfully', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;
      
      jest.spyOn(cacheRepository, 'set').mockResolvedValue(undefined);

      await useCase.execute(key, value, ttl);

      expect(cacheRepository.set).toHaveBeenCalledWith(
        expect.any(CacheItem)
      );
      expect(loggerService.log).toHaveBeenCalledWith(
        `Cache set for key: ${key}`
      );
    });

    it('should handle repository errors', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const error = new Error('Repository error');
      
      jest.spyOn(cacheRepository, 'set').mockRejectedValue(error);

      await expect(useCase.execute(key, value)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(
        `Error setting cache for key: ${key}`,
        error.stack,
      );
    });

    it('should set cache without TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      
      jest.spyOn(cacheRepository, 'set').mockResolvedValue(undefined);

      await useCase.execute(key, value);

      expect(cacheRepository.set).toHaveBeenCalledWith(
        expect.any(CacheItem)
      );
    });
  });
}); 