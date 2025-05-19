/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { CachePatternController } from '../../../src/infrastructure/controllers/cache-pattern.controller';
import { CacheInvalidationService } from '../../../src/infrastructure/services/cache-invalidation.service';

describe('CachePatternController', () => {
  let controller: CachePatternController;
  let cacheInvalidationService: CacheInvalidationService;

  const mockCacheInvalidationService = {
    registerInvalidationPattern: jest.fn(),
    invalidateByPattern: jest.fn(),
    invalidateKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CachePatternController],
      providers: [
        {
          provide: CacheInvalidationService,
          useValue: mockCacheInvalidationService,
        },
      ],
    }).compile();

    controller = module.get<CachePatternController>(CachePatternController);
    cacheInvalidationService = module.get<CacheInvalidationService>(CacheInvalidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerPattern', () => {
    it('should register a new invalidation pattern', async () => {
      const pattern = 'test:*';
      const ttl = 3600;

      const result = await controller.registerPattern({ pattern, ttl });

      expect(mockCacheInvalidationService.registerInvalidationPattern).toHaveBeenCalledWith(pattern, ttl);
      expect(result).toEqual({
        message: `Patrón ${pattern} registrado con TTL de ${ttl} segundos`,
      });
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate cache by pattern', async () => {
      const pattern = 'test:*';

      const result = await controller.invalidatePattern(pattern);

      expect(mockCacheInvalidationService.invalidateByPattern).toHaveBeenCalledWith(pattern);
      expect(result).toEqual({
        message: `Claves invalidadas para el patrón: ${pattern}`,
      });
    });

    it('should handle invalidation errors', async () => {
      const pattern = 'test:*';
      const error = new Error('Invalidation failed');
      mockCacheInvalidationService.invalidateByPattern.mockRejectedValue(error);

      await expect(controller.invalidatePattern(pattern)).rejects.toThrow(error);
    });
  });

  describe('invalidateKey', () => {
    it('should invalidate cache by key', async () => {
      const key = 'test-key';

      const result = await controller.invalidateKey(key);

      expect(mockCacheInvalidationService.invalidateKey).toHaveBeenCalledWith(key);
      expect(result).toEqual({
        message: `Clave invalidada: ${key}`,
      });
    });

    it('should handle key invalidation errors', async () => {
      const key = 'test-key';
      const error = new Error('Key invalidation failed');
      mockCacheInvalidationService.invalidateKey.mockRejectedValue(error);

      await expect(controller.invalidateKey(key)).rejects.toThrow(error);
    });
  });
}); 