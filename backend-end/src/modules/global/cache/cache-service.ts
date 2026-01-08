import { Injectable } from '@nestjs/common';
import { CacheType, CacheStrategyFactory } from './cache-strategy-factory';

@Injectable()
export class CacheService {
  constructor(private readonly factory: CacheStrategyFactory) {}

  async getOrSet<T>(
    key: string,
    type: CacheType,
    ttl: number,
    factoryFn: () => Promise<T>,
  ): Promise<T> {
    const strategy = this.factory.getStrategy(type);

    const cached = await strategy.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factoryFn();
    await strategy.set(key, value, ttl);

    return value;
  }
}
