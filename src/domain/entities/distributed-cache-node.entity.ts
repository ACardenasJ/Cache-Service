/* eslint-disable prettier/prettier */
export class DistributedCacheNode {
  constructor(
    public readonly nodeId: string,
    public readonly host: string,
    public readonly port: number,
    public readonly isLeader: boolean = false,
    public readonly lastHeartbeat: Date = new Date(),
  ) {}
} 