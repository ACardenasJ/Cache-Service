import { Test, TestingModule } from '@nestjs/testing';
import { GetCacheUseCase } from '../../../src/application/use-cases/get-cache.use-case';
import { ICacheRepository } from '../../../src/domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../../src/domain/repositories/cache-repository.token';
import { LoggerService } from '../../../src/infrastructure/services/logger.service';
import { CacheItem } from '../../../src/domain/entities/cache-item.entity';

describe('GetCacheUseCase', () => {
  let useCase: GetCacheUseCase;
  let cacheRepository: ICacheRepository;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCacheUseCase,
        {
          provide: CACHE_REPOSITORY,
          useValue: {
            get: jest.fn(),
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

    useCase = module.get<GetCacheUseCase>(GetCacheUseCase);
    cacheRepository = module.get<ICacheRepository>(CACHE_REPOSITORY);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return cached value when exists', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const cacheItem = new CacheItem(key, value);
      jest.spyOn(cacheRepository, 'get').mockResolvedValue(cacheItem);

      const result = await useCase.execute(key);
      expect(result).toBe(value);
      expect(cacheRepository.get).toHaveBeenCalledWith(key);
      expect(loggerService.log).toHaveBeenCalledWith(`Cache hit for key: ${key}`);
    });

    it('should return null when cache miss', async () => {
      const key = 'test-key';
      jest.spyOn(cacheRepository, 'get').mockResolvedValue(null);

      const result = await useCase.execute(key);
      expect(result).toBeNull();
      expect(cacheRepository.get).toHaveBeenCalledWith(key);
      expect(loggerService.log).toHaveBeenCalledWith(`Cache miss for key: ${key}`);
    });

    it('should handle repository errors', async () => {
      const key = 'test-key';
      const error = new Error('Repository error');
      jest.spyOn(cacheRepository, 'get').mockRejectedValue(error);

      await expect(useCase.execute(key)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(
        `Error getting cache for key: ${key}`,
        error.stack,
      );
    });
  });
}); 