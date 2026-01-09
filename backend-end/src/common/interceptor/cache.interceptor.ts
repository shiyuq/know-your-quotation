import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';

import { CacheService } from '@/modules/global/cache/cache-service';
import { CacheType } from '@/modules/global/cache/cache-strategy-factory';
import { Cached } from '@/common/decorator/cache.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if ((context.getType() as string) === 'graphql') {
      return next.handle();
    }

    const handler = context.getHandler();
    const targetClass = context.getClass();

    // 方法优先，其次类级别
    const options =
      this.reflector.get(Cached, handler) ??
      this.reflector.get(Cached, targetClass);

    if (!options) {
      return next.handle();
    }

    const { type = CacheType.REDIS, ttl = 1 * 60 * 60 * 1000, key } = options;

    const request = context.switchToHttp().getRequest();

    const safeArgs = {
      params: request.params,
      query: request.query,
      body: request.body,
    };

    const cacheKey =
      typeof key === 'function'
        ? key([safeArgs])
        : (key ??
          `${targetClass.name}:${handler.name}:${JSON.stringify(safeArgs)}`);

    return from(
      this.cacheService.getOrSet(cacheKey, type, ttl, () =>
        lastValueFrom(next.handle()),
      ),
    );
  }
}
