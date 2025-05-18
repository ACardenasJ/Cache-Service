/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { AWSRedisCacheRepository } from '../aws-redis-cache.repository';
import { ConsensusService } from '../../services/consensus.service';
import { ConfigService } from '@nestjs/config';
import { CacheItem } from '../../../domain/entities/cache-item.entity';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('AWSRedisCacheRepository', () => {
  let repository: AWSRedisCacheRepository;
  let consensusService: ConsensusService;
  let configService: ConfigService;

  const mockConsensusService = {
    incrementVersion: jest.fn(),
    checkVersion: jest.fn(),
    acquireLock: jest.fn(),
    releaseLock: jest.fn(),
    validateWrite: jest.fn(),
    resolveConflicts: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AWSRedisCacheRepository,
        {
          provide: ConsensusService,
          useValue: mockConsensusService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<AWSRedisCacheRepository>(AWSRedisCacheRepository);
    consensusService = module.get<ConsensusService>(ConsensusService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should store item in Redis and increment version', async () => {
      const mockRedis = {
        set: jest.fn().mockResolvedValue('OK'),
      };
      (Redis as jest.Mock).mockImplementation(() => mockRedis);

      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);

      expect(mockRedis.set).toHaveBeenCalled();
      expect(consensusService.incrementVersion).toHaveBeenCalledWith('test-key');
    });

    it('should set TTL when provided', async () => {
      const mockRedis = {
        set: jest.fn().mockResolvedValue('OK'),
      };
      (Redis as jest.Mock).mockImplementation(() => mockRedis);

      const item = new CacheItem('test-key', 'test-value', 3600);
      await repository.set(item);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        expect.any(String),
        'EX',
        3600
      );
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null),
      };
      (Redis as jest.Mock).mockImplementation(() => mockRedis);

      const result = await repository.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return item for existing key', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(
          JSON.stringify({
            key: 'test-key',
            value: 'test-value',
            createdAt: new Date().toISOString(),
          })
        ),
      };
      (Redis as jest.Mock).mockImplementation(() => mockRedis);

      const result = await repository.get('test-key');
      expect(result).toBeDefined();
      expect(result.value).toBe('test-value');
    });
  });

  describe('delete', () => {
    it('should delete item from Redis and release lock', async () => {
      const mockRedis = {
        del: jest.fn().mockResolvedValue(1),
      };
      (Redis as jest.Mock).mockImplementation(() => mockRedis);

      await repository.delete('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
      expect(consensusService.releaseLock).toHaveBeenCalledWith('test-key');
    });
  });

  describe('setWithConsistency', () => {
    it('should set value when no nodes are available', async () => {
      const mockRedis = {
        set: jest.fn().mockResolvedValue('OK'),
        hgetall: jest.fn().mockResolvedValue({}),
      };
      (Redis as jest.Mock).mockImplementation(() => mockRedis);

      const item = new CacheItem('test-key', 'test-value');
      await repository.setWithConsistency(item);

      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should throw error when consensus validation fails', async () => {
      const mockRedis = {
        hgetall: jest.fn().mockResolvedValue({ node1: '{}' }),
      };
      (Redis as jest.Mock).mockImplementation(() => mockRedis);
      mockConsensusService.validateWrite.mockResolvedValue(false);

      const item = new CacheItem('test-key', 'test-value');

      await expect(repository.setWithConsistency(item)).rejects.toThrow(
        'No se pudo alcanzar consenso para la escritura'
      );
    });
  });
}); 