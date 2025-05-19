/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { AWSRedisCacheRepository } from '../../../src/infrastructure/repositories/aws-redis-cache.repository';
import { ConsensusService } from '../../../src/infrastructure/services/consensus.service';
import { ConfigService } from '@nestjs/config';
import { CacheItem } from '../../../src/domain/entities/cache-item.entity';
import Redis from 'ioredis';
import { EventEmitter } from 'events';

// Create proper mock for Redis extending EventEmitter
class RedisMock extends EventEmitter {
  get = jest.fn();
  set = jest.fn();
  del = jest.fn();
  keys = jest.fn();
  hgetall = jest.fn();
  hget = jest.fn();
  hset = jest.fn();
  hdel = jest.fn();
  flushdb = jest.fn();
  quit = jest.fn();
}

const redisMockInstance = new RedisMock();

// Mock the Redis constructor
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => redisMockInstance);
});

describe('AWSRedisCacheRepository', () => {
  let repository: AWSRedisCacheRepository;
  let consensusService: ConsensusService;
  let configService: ConfigService;
  let redisClient: RedisMock;

  const mockConsensusService = {
    incrementVersion: jest.fn(),
    checkVersion: jest.fn(),
    acquireLock: jest.fn(),
    releaseLock: jest.fn(),
    validateWrite: jest.fn(),
    resolveConflicts: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'AWS_ELASTICACHE_ENDPOINT':
          return 'localhost';
        case 'AWS_ELASTICACHE_PORT':
          return 6379;
        case 'AWS_ELASTICACHE_AUTH_TOKEN':
          return 'mock-token';
        default:
          return undefined;
      }
    }),
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
        {
          provide: Redis,
          useValue: redisMockInstance,
        },
      ],
    }).compile();

    repository = module.get<AWSRedisCacheRepository>(AWSRedisCacheRepository);
    consensusService = module.get<ConsensusService>(ConsensusService);
    configService = module.get<ConfigService>(ConfigService);
    redisClient = module.get(Redis);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should store item in Redis and increment version', async () => {
      redisClient.set.mockResolvedValue('OK');

      const item = new CacheItem('test-key', 'test-value');
      await repository.set(item);

      expect(redisClient.set).toHaveBeenCalled();
      expect(consensusService.incrementVersion).toHaveBeenCalledWith('test-key');
    });

    it('should set TTL when provided', async () => {
      redisClient.set.mockResolvedValue('OK');

      const item = new CacheItem('test-key', 'test-value', 3600);
      await repository.set(item);

      expect(redisClient.set).toHaveBeenCalledWith(
        'test-key',
        expect.any(String),
        'EX',
        3600
      );
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      redisClient.get.mockResolvedValue(null);

      const result = await repository.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return item for existing key', async () => {
      const mockValue = JSON.stringify({
        key: 'test-key',
        value: 'test-value',
        lastModified: new Date().toISOString(),
      });
      
      redisClient.get.mockResolvedValue(mockValue);

      const result = await repository.get('test-key');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.value).toBe('test-value');
      }
    });
  });

  describe('delete', () => {
    it('should delete item from Redis and release lock', async () => {
      redisClient.del.mockResolvedValue(1);

      await repository.delete('test-key');

      expect(redisClient.del).toHaveBeenCalledWith('test-key');
      expect(consensusService.releaseLock).toHaveBeenCalledWith('test-key');
    });
  });

  describe('setWithConsistency', () => {
    it('should set value when no nodes are available', async () => {
      redisClient.set.mockResolvedValue('OK');
      redisClient.hgetall.mockResolvedValue({});

      const item = new CacheItem('test-key', 'test-value');
      await repository.setWithConsistency(item);

      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should throw error when consensus validation fails', async () => {
      redisClient.hgetall.mockResolvedValue({ node1: '{}' });
      mockConsensusService.validateWrite.mockResolvedValue(false);

      const item = new CacheItem('test-key', 'test-value');

      await expect(repository.setWithConsistency(item)).rejects.toThrow(
        'No se pudo alcanzar consenso para la escritura'
      );
    });
  });

  describe('getKeys', () => {
    it('should return all cache keys', async () => {
      const pattern = '*';
      const expectedKeys = ['key1', 'key2'];
      redisClient.keys.mockResolvedValue(expectedKeys);

      const result = await repository.getKeys(pattern);
      expect(result).toEqual(expectedKeys);
      expect(redisClient.keys).toHaveBeenCalledWith(pattern);
    });
  });
}); 