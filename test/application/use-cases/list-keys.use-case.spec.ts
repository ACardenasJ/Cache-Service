import { Test, TestingModule } from '@nestjs/testing';
import { ListKeysUseCase } from '../../../src/application/use-cases/list-keys.use-case';
import { ICacheRepository } from '../../../src/domain/repositories/cache-repository.interface';
import { CACHE_REPOSITORY } from '../../../src/domain/repositories/cache-repository.token';
import { LoggerService } from '../../../src/infrastructure/services/logger.service';

describe('ListKeysUseCase', () => {
  let useCase: ListKeysUseCase;
  let cacheRepository: ICacheRepository;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListKeysUseCase,
        {
          provide: CACHE_REPOSITORY,
          useValue: {
            getKeys: jest.fn(),
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

    useCase = module.get<ListKeysUseCase>(ListKeysUseCase);
    cacheRepository = module.get<ICacheRepository>(CACHE_REPOSITORY);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return list of keys successfully', async () => {
      const pattern = '*';
      const keys = ['key1', 'key2', 'key3'];
      jest.spyOn(cacheRepository, 'getKeys').mockResolvedValue(keys);

      const result = await useCase.execute(pattern);

      expect(result).toEqual(keys);
      expect(cacheRepository.getKeys).toHaveBeenCalledWith(pattern);
      expect(loggerService.log).toHaveBeenCalledWith(
        `Listed keys with pattern: ${pattern}`
      );
    });

    it('should return empty array when no keys match pattern', async () => {
      const pattern = 'non-existent*';
      jest.spyOn(cacheRepository, 'getKeys').mockResolvedValue([]);

      const result = await useCase.execute(pattern);

      expect(result).toEqual([]);
      expect(cacheRepository.getKeys).toHaveBeenCalledWith(pattern);
      expect(loggerService.log).toHaveBeenCalledWith(
        `Listed keys with pattern: ${pattern}`
      );
    });

    it('should handle repository errors', async () => {
      const pattern = '*';
      const error = new Error('Repository error');
      jest.spyOn(cacheRepository, 'getKeys').mockRejectedValue(error);

      await expect(useCase.execute(pattern)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(
        `Error listing keys with pattern: ${pattern}`,
        error.stack,
      );
    });
  });
}); 