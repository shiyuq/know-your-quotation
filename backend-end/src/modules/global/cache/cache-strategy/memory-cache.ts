import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheStrategy } from '../interface';

@Injectable()
export class MemoryCacheStrategy implements CacheStrategy {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  get<T>(key: string) {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number) {
    await this.cache.set(key, value, ttl);
  }
}
