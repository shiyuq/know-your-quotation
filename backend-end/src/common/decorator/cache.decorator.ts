import { CacheType } from '@/modules/global/cache/cache-strategy-factory';
import { Reflector } from '@nestjs/core';

interface CacheOptions {
  type?: CacheType;
  ttl?: number;
  key?: string | ((args: any[]) => string);
}

export const Cached = Reflector.createDecorator<CacheOptions>();
