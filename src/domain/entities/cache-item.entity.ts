/* eslint-disable prettier/prettier */
export class CacheItem {
  constructor(
    public readonly key: string,
    public readonly value: any,
    public readonly ttl?: number,
    public readonly version: number = 1,
    public readonly lastModified: Date = new Date(),
    public readonly nodeId?: string,
  ) {}

  isExpired(): boolean {
    if (!this.ttl) return false;
    const now = Date.now();
    const expirationTime = this.lastModified.getTime() + (this.ttl * 1000);
    return now > expirationTime;
  }

  withNewVersion(): CacheItem {
    return new CacheItem(
      this.key,
      this.value,
      this.ttl,
      this.version + 1,
      new Date(),
      this.nodeId,
    );
  }
} 