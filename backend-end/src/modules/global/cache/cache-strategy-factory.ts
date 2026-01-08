import { Injectable } from '@nestjs/common';
import { MemoryCacheStrategy } from './cache-strategy/memory-cache';
import { RedisCacheStrategy } from './cache-strategy/redis-cache';
import { CacheStrategy } from './interface';

export enum CacheType {
  MEMORY = 'memory',
  REDIS = 'redis',
}

@Injectable()
export class CacheStrategyFactory {
  constructor(
    private readonly memory: MemoryCacheStrategy,
    private readonly redis: RedisCacheStrategy,
  ) {}

  getStrategy(type: CacheType): CacheStrategy {
    switch (type) {
      case CacheType.REDIS:
        return this.redis;
      case CacheType.MEMORY:
      default:
        return this.memory;
    }
  }
}
