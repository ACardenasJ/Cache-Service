import { ICacheRepository } from './cache-repository.interface';

export const CACHE_REPOSITORY = Symbol('CACHE_REPOSITORY');
export type CacheRepositoryToken = ICacheRepository; 