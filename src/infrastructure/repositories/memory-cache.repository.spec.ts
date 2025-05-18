import { Test, TestingModule } from '@nestjs/testing';
import { MemoryCacheRepository } from './memory-cache.repository';
import { ConsensusService } from '../services/consensus.service';
import { CacheItem } from '../../domain/entities/cache-item.entity';

describe('MemoryCacheRepository', () => {
  let repository: MemoryCacheRepository;
  let consensusService: ConsensusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryCacheRepository,
        {
          provide: ConsensusService,
          useValue: {
            incrementVersion: jest.fn().mockResolvedValue(undefined),
            checkVersion: jest.fn().mockResolvedValue(true),
            acquireLock: jest.fn().mockResolvedValue(true),
            releaseLock: jest.fn().mockResolvedValue(undefined),
            validateWrite: jest.fn().mockResolvedValue(true),
            resolveConflicts: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    repository = module.get<MemoryCacheRepository>(MemoryCacheRepository);
    consensusService = module.get<ConsensusService>(ConsensusService);
  });

  describe('basic operations', () => {
    it('should set and get item successfully', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);
      const result = await repository.get('test-key');
      expect(result).toBeDefined();
      expect(result.key).toBe(item.key);
      expect(result.value).toBe(item.value);
    });

    it('should return null for non-existent key', async () => {
      const result = await repository.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete item successfully', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);
      await repository.delete('test-key');
      const result = await repository.get('test-key');
      expect(result).toBeNull();
    });

    it('should handle expired items', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const item = new CacheItem('test-key', 'test-value', 60, 1, pastDate);
      await repository.set(item);
      const result = await repository.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('distributed operations', () => {
    it('should set with consistency when quorum is met', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await expect(repository.setWithConsistency(item, 1)).resolves.not.toThrow();
      expect(consensusService.validateWrite).toHaveBeenCalled();
    });

    it('should get with version', async () => {
      const item = new CacheItem('test-key', 'test-value', undefined, 1);
      await repository.set(item);
      const result = await repository.getWithVersion('test-key');
      expect(result).toBeDefined();
      expect(result.version).toBe(1);
    });

    it('should compare and set when version matches', async () => {
      const success = await repository.compareAndSet('test-key', 'new-value', 1);
      expect(success).toBeTruthy();
      expect(consensusService.checkVersion).toHaveBeenCalledWith('test-key', 1);
    });
  });
}); 