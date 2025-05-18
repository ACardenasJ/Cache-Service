import { CacheItem } from '../../../src/domain/entities/cache-item.entity';

describe('CacheItem', () => {
  describe('isExpired', () => {
    it('should return false when ttl is not set', () => {
      const item = new CacheItem('key', 'value');
      expect(item.isExpired()).toBeFalsy();
    });

    it('should return false when item has not expired', () => {
      const item = new CacheItem('key', 'value', 60); // 60 seconds TTL
      expect(item.isExpired()).toBeFalsy();
    });

    it('should return true when item has expired', () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const item = new CacheItem('key', 'value', 60, 1, pastDate);
      expect(item.isExpired()).toBeTruthy();
    });
  });

  describe('withNewVersion', () => {
    it('should create new item with incremented version', () => {
      const item = new CacheItem('key', 'value', 60, 1);
      const newItem = item.withNewVersion();
      
      expect(newItem.version).toBe(2);
      expect(newItem.key).toBe(item.key);
      expect(newItem.value).toBe(item.value);
      expect(newItem.ttl).toBe(item.ttl);
      expect(newItem.lastModified).not.toBe(item.lastModified);
    });
  });
}); 