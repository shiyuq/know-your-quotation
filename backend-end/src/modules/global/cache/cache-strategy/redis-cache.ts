import { Inject, Injectable } from '@nestjs/common';

import { CacheStrategy } from '../interface';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class RedisCacheStrategy implements CacheStrategy {
  private readonly keyv: Keyv;

  constructor() {
    this.keyv = new Keyv({
      store: new KeyvRedis('redis://localhost:6380'),
      namespace: 'cache',
    });
  }

  get<T>(key: string) {
    console.log('[REDIS][GET]', key);
    return this.keyv.get(key);
  }

  async set<T>(key: string, value: T, ttl?: number) {
    console.log('[REDIS][SET]', key, value, 'ttl=', ttl);
    await this.keyv.set(key, value, ttl);
  }
}
