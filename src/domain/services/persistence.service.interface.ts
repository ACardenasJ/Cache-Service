export interface IPersistenceService {
  set(key: string, value: any, ttl?: number): Promise<boolean>;
  get(key: string): Promise<any>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  flushAll(): Promise<void>;
} 