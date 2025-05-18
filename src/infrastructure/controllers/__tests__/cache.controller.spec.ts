/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { CacheController } from '../cache.controller';
import { SetCacheUseCase } from '../../../application/use-cases/set-cache.use-case';
import { GetCacheUseCase } from '../../../application/use-cases/get-cache.use-case';
import { SetDistributedCacheUseCase } from '../../../application/use-cases/set-distributed-cache.use-case';
import { CompareAndSetCacheUseCase } from '../../../application/use-cases/compare-and-set-cache.use-case';
import { LoggerService } from '../../services/logger.service';

describe('CacheController', () => {
  let controller: CacheController;
  let setCacheUseCase: SetCacheUseCase;
  let getCacheUseCase: GetCacheUseCase;
  let setDistributedCacheUseCase: SetDistributedCacheUseCase;
  let compareAndSetCacheUseCase: CompareAndSetCacheUseCase;

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
      ],
    }).compile();

    controller = module.get<CacheController>(CacheController);
    setCacheUseCase = module.get<SetCacheUseCase>(SetCacheUseCase);
    getCacheUseCase = module.get<GetCacheUseCase>(GetCacheUseCase);
    setDistributedCacheUseCase = module.get<SetDistributedCacheUseCase>(SetDistributedCacheUseCase);
    compareAndSetCacheUseCase = module.get<CompareAndSetCacheUseCase>(CompareAndSetCacheUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setCache', () => {
    it('should call setCacheUseCase with correct parameters', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;

      await controller.setCache(key, { value, ttl });

      expect(setCacheUseCase.execute).toHaveBeenCalledWith(key, value, ttl);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Setting cache for key: ${key}`,
        'CacheController'
      );
    });
  });

  describe('getCache', () => {
    it('should return value from getCacheUseCase', async () => {
      const key = 'test-key';
      const expectedValue = 'test-value';
      mockGetCacheUseCase.execute.mockResolvedValue(expectedValue);

      const result = await controller.getCache(key);

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
}); 