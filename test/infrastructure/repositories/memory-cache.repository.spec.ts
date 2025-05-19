/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryCacheRepository } from '../../../src/infrastructure/repositories/memory-cache.repository';
import { ConsensusService } from '../../../src/infrastructure/services/consensus.service';
import { CacheItem } from '../../../src/domain/entities/cache-item.entity';

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

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('set and get', () => {
    it('should store and retrieve item', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);
      const storedItem = await repository.get('test-key');
      
      expect(storedItem).not.toBeNull();
      if (storedItem) {
        expect(storedItem.value).toBe('test-value');
      }
    });

    it('should return null for non-existent key', async () => {
      const result = await repository.get('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove item from cache', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);
      await repository.delete('test-key');
      
      const result = await repository.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('distributed operations', () => {
    it('should set with consistency when quorum is met', async () => {
      // Add a mock node to trigger validateWrite
      const mockNode = {
        nodeId: 'test-node',
        address: 'localhost',
        lastHeartbeat: new Date()
      };
      (repository as any).nodes.set(mockNode.nodeId, mockNode);
      
      const item = new CacheItem('test-key', 'test-value');
      await expect(repository.setWithConsistency(item, 1)).resolves.not.toThrow();
      expect(consensusService.validateWrite).toHaveBeenCalled();
    });

    it('should get with version', async () => {
      const item = new CacheItem('test-key', 'test-value', undefined, 1);
      await repository.set(item);
      const result = await repository.getWithVersion('test-key');
      expect(result).toBeDefined();
      if (result) {
        expect(result.version).toBe(1);
      }
    });

    it('should compare and set when version matches', async () => {
      const success = await repository.compareAndSet('test-key', 'new-value', 1);
      expect(success).toBeTruthy();
      expect(consensusService.checkVersion).toHaveBeenCalledWith('test-key', 1);
    });
  });
}); 