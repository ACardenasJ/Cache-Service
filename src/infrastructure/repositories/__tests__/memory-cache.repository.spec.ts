/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryCacheRepository } from '../memory-cache.repository';
import { ConsensusService } from '../../services/consensus.service';
import { CacheItem } from '../../../domain/entities/cache-item.entity';

describe('MemoryCacheRepository', () => {
  let repository: MemoryCacheRepository;
  let consensusService: ConsensusService;

  const mockConsensusService = {
    incrementVersion: jest.fn(),
    checkVersion: jest.fn(),
    acquireLock: jest.fn(),
    releaseLock: jest.fn(),
    validateWrite: jest.fn(),
    resolveConflicts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryCacheRepository,
        {
          provide: ConsensusService,
          useValue: mockConsensusService,
        },
      ],
    }).compile();

    repository = module.get<MemoryCacheRepository>(MemoryCacheRepository);
    consensusService = module.get<ConsensusService>(ConsensusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should store item and increment version', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);

      const storedItem = await repository.get('test-key');
      expect(storedItem).toBeDefined();
      expect(storedItem.value).toBe('test-value');
      expect(consensusService.incrementVersion).toHaveBeenCalledWith('test-key');
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const result = await repository.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return item for existing key', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);

      const result = await repository.get('test-key');
      expect(result).toBeDefined();
      expect(result.value).toBe('test-value');
    });
  });

  describe('compareAndSet', () => {
    it('should update value when version matches', async () => {
      mockConsensusService.checkVersion.mockResolvedValue(true);
      mockConsensusService.acquireLock.mockResolvedValue(true);

      const result = await repository.compareAndSet('test-key', 'new-value', 1);
      expect(result).toBe(true);
      expect(consensusService.checkVersion).toHaveBeenCalledWith('test-key', 1);
      expect(consensusService.acquireLock).toHaveBeenCalled();
      expect(consensusService.releaseLock).toHaveBeenCalled();
    });

    it('should not update value when version does not match', async () => {
      mockConsensusService.checkVersion.mockResolvedValue(false);

      const result = await repository.compareAndSet('test-key', 'new-value', 1);
      expect(result).toBe(false);
      expect(consensusService.acquireLock).not.toHaveBeenCalled();
    });
  });

  describe('setWithConsistency', () => {
    it('should set value when no nodes are available', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.setWithConsistency(item);

      const storedItem = await repository.get('test-key');
      expect(storedItem).toBeDefined();
      expect(storedItem.value).toBe('test-value');
    });

    it('should throw error when consensus validation fails', async () => {
      mockConsensusService.validateWrite.mockResolvedValue(false);
      const item = new CacheItem('test-key', 'test-value');

      await expect(repository.setWithConsistency(item)).rejects.toThrow(
        'No se pudo alcanzar consenso para la escritura'
      );
    });
  });

  describe('delete', () => {
    it('should delete item and release lock', async () => {
      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);
      await repository.delete('test-key');

      const result = await repository.get('test-key');
      expect(result).toBeNull();
      expect(consensusService.releaseLock).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clear', () => {
    it('should remove all items', async () => {
      await repository.set(new CacheItem('key1', 'value1'));
      await repository.set(new CacheItem('key2', 'value2'));

      await repository.clear();

      expect(await repository.get('key1')).toBeNull();
      expect(await repository.get('key2')).toBeNull();
    });
  });
}); 