import { CacheService } from './cache-service';
import { CacheStrategyFactory } from './cache-strategy-factory';
import { MemoryCacheStrategy } from './cache-strategy/memory-cache';
import { Module } from '@nestjs/common';
import { RedisCacheStrategy } from './cache-strategy/redis-cache';

@Module({
  providers: [
    CacheService,
    CacheStrategyFactory,
    MemoryCacheStrategy,
    RedisCacheStrategy,
  ],
  exports: [CacheService],
})
export class LocalCacheModule {}
