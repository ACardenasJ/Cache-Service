/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { CacheController } from '../../../src/infrastructure/controllers/cache.controller';
import { SetCacheUseCase } from '../../../src/application/use-cases/set-cache.use-case';
import { GetCacheUseCase } from '../../../src/application/use-cases/get-cache.use-case';
import { SetDistributedCacheUseCase } from '../../../src/application/use-cases/set-distributed-cache.use-case';
import { CompareAndSetCacheUseCase } from '../../../src/application/use-cases/compare-and-set-cache.use-case';
import { LoggerService } from '../../../src/infrastructure/services/logger.service';
import { DeleteCacheUseCase } from '../../../src/application/use-cases/delete-cache.use-case';
import { ListKeysUseCase } from '../../../src/application/use-cases/list-keys.use-case';
import { LocalCacheService } from '../../../src/infrastructure/services/local-cache.service';

describe('CacheController', () => {
  let controller: CacheController;
  let setCacheUseCase: SetCacheUseCase;
  let getCacheUseCase: GetCacheUseCase;
  let setDistributedCacheUseCase: SetDistributedCacheUseCase;
  let compareAndSetCacheUseCase: CompareAndSetCacheUseCase;
  let deleteCacheUseCase: DeleteCacheUseCase;
  let listKeysUseCase: ListKeysUseCase;
  let localCacheService: LocalCacheService;

  const mockSetCacheUseCase = {
    execute: jest.fn(),
  };

  const mockGetCacheUseCase = {
    execute: jest.fn(),
  };

  const mockSetDistributedCacheUseCase = {
    execute: jest.fn(),
  };

  const mockCompareAndSetCacheUseCase = {
    execute: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockLocalCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheController],
      providers: [
        {
          provide: SetCacheUseCase,
          useValue: mockSetCacheUseCase,
        },
        {
          provide: GetCacheUseCase,
          useValue: mockGetCacheUseCase,
        },
        {
          provide: SetDistributedCacheUseCase,
          useValue: mockSetDistributedCacheUseCase,
        },
        {
          provide: CompareAndSetCacheUseCase,
          useValue: mockCompareAndSetCacheUseCase,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: DeleteCacheUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ListKeysUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LocalCacheService,
          useValue: mockLocalCacheService,
        },
      ],
    }).compile();

    controller = module.get<CacheController>(CacheController);
    setCacheUseCase = module.get<SetCacheUseCase>(SetCacheUseCase);
    getCacheUseCase = module.get<GetCacheUseCase>(GetCacheUseCase);
    setDistributedCacheUseCase = module.get<SetDistributedCacheUseCase>(SetDistributedCacheUseCase);
    compareAndSetCacheUseCase = module.get<CompareAndSetCacheUseCase>(CompareAndSetCacheUseCase);
    deleteCacheUseCase = module.get<DeleteCacheUseCase>(DeleteCacheUseCase);
    listKeysUseCase = module.get<ListKeysUseCase>(ListKeysUseCase);
    localCacheService = module.get<LocalCacheService>(LocalCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should call setCacheUseCase with correct parameters', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;

      await controller.set(key, { value, ttl });

      expect(setCacheUseCase.execute).toHaveBeenCalledWith(key, value, ttl);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Setting cache for key: ${key}`,
        'CacheController'
      );
    });
  });

  describe('get', () => {
    it('should return value from getCacheUseCase', async () => {
      const key = 'test-key';
      const expectedValue = 'test-value';
      mockGetCacheUseCase.execute.mockResolvedValue(expectedValue);

      const result = await controller.get(key);

      expect(result).toBe(expectedValue);
      expect(getCacheUseCase.execute).toHaveBeenCalledWith(key);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Getting cache for key: ${key}`,
        'CacheController'
      );
    });
  });

  describe('setDistributedCache', () => {
    it('should call setDistributedCacheUseCase with correct parameters', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;
      const quorum = 2;

      await controller.setDistributedCache(key, { value, ttl, quorum });

      expect(setDistributedCacheUseCase.execute).toHaveBeenCalledWith(
        key,
        value,
        ttl,
        quorum
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Setting distributed cache for key: ${key}`,
        'CacheController'
      );
    });
  });

  describe('compareAndSetCache', () => {
    it('should return success true when compareAndSet succeeds', async () => {
      const key = 'test-key';
      const value = 'new-value';
      const expectedVersion = 1;
      mockCompareAndSetCacheUseCase.execute.mockResolvedValue(true);

      const result = await controller.compareAndSetCache(key, {
        value,
        expectedVersion,
      });

      expect(result).toEqual({ success: true });
      expect(compareAndSetCacheUseCase.execute).toHaveBeenCalledWith(
        key,
        value,
        expectedVersion
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Attempting compare-and-set for key: ${key}`,
        'CacheController'
      );
    });

    it('should return success false when compareAndSet fails', async () => {
      const key = 'test-key';
      mockCompareAndSetCacheUseCase.execute.mockResolvedValue(false);

      const result = await controller.compareAndSetCache(key, {
        value: 'new-value',
        expectedVersion: 1,
      });

      expect(result).toEqual({ success: false });
    });
  });

  describe('delete', () => {
    it('should delete cached value and local cache', async () => {
      const key = 'test-key';
      jest.spyOn(deleteCacheUseCase, 'execute').mockResolvedValue(undefined);

      await controller.delete(key);
      
      expect(deleteCacheUseCase.execute).toHaveBeenCalledWith(key);
      expect(mockLocalCacheService.delete).toHaveBeenCalledWith(key);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Deleting cache for key: ${key}`,
        'CacheController'
      );
    });
  });

  describe('listKeys', () => {
    it('should return all cache keys', async () => {
      const pattern = '*';
      const keys = ['key1', 'key2'];
      jest.spyOn(listKeysUseCase, 'execute').mockResolvedValue(keys);

      const result = await controller.listKeys(pattern);
      expect(result).toEqual(keys);
      expect(listKeysUseCase.execute).toHaveBeenCalledWith(pattern);
    });
  });

  describe('deleteLocalCache', () => {
    it('should delete specific key from local cache', async () => {
      const key = 'test-key';
      
      await controller.deleteLocalCache(key);
      
      expect(mockLocalCacheService.delete).toHaveBeenCalledWith(key);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Deleting local cache for key: ${key}`,
        'CacheController'
      );
    });
  });

  describe('clearLocalCache', () => {
    it('should clear all local cache', async () => {
      await controller.clearLocalCache();
      
      expect(mockLocalCacheService.clear).toHaveBeenCalled();
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Clearing all local cache',
        'CacheController'
      );
    });
  });

  describe('getLocalCacheStats', () => {
    it('should return local cache statistics', async () => {
      const mockStats = {
        size: 2,
        entries: [
          { key: 'key1', expiresIn: 30 },
          { key: 'key2', expiresIn: 45 }
        ]
      };
      mockLocalCacheService.getStats.mockReturnValue(mockStats);

      const result = await controller.getLocalCacheStats();
      
      expect(result).toEqual(mockStats);
      expect(mockLocalCacheService.getStats).toHaveBeenCalled();
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Getting local cache statistics',
        'CacheController'
      );
    });
  });
}); 