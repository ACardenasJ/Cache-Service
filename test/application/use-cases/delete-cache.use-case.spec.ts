import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCacheUseCase } from '../../../src/application/use-cases/delete-cache.use-case';
import { ICacheRepository } from '../../../src/domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../../src/domain/repositories/cache-repository.token';
import { LoggerService } from '../../../src/infrastructure/services/logger.service';

describe('DeleteCacheUseCase', () => {
  let useCase: DeleteCacheUseCase;
  let cacheRepository: ICacheRepository;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCacheUseCase,
        {
          provide: CACHE_REPOSITORY,
          useValue: {
            delete: jest.fn(),
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

    useCase = module.get<DeleteCacheUseCase>(DeleteCacheUseCase);
    cacheRepository = module.get<ICacheRepository>(CACHE_REPOSITORY);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete cache value successfully', async () => {
      const key = 'test-key';
      jest.spyOn(cacheRepository, 'delete').mockResolvedValue(undefined);

      await useCase.execute(key);

      expect(cacheRepository.delete).toHaveBeenCalledWith(key);
      expect(loggerService.log).toHaveBeenCalledWith(
        `Cache deleted for key: ${key}`
      );
    });

    it('should handle repository errors', async () => {
      const key = 'test-key';
      const error = new Error('Repository error');
      jest.spyOn(cacheRepository, 'delete').mockRejectedValue(error);

      await expect(useCase.execute(key)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(
        `Error deleting cache for key: ${key}`,
        error.stack,
      );
    });
  });
}); 