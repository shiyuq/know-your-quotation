import { CacheType } from '@/modules/global/cache/cache-strategy-factory';
import { Reflector } from '@nestjs/core';

interface CacheOptions {
  type?: CacheType;
  ttl?: number;
  key: string | ((args: any) => string);
}

export const CachedDecorator = Reflector.createDecorator<CacheOptions>();

export function Cached(options: CacheOptions): MethodDecorator {
  return CachedDecorator(options);
}
