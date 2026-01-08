import { Inject, Injectable } from '@nestjs/common';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheStrategy } from '../interface';

@Injectable()
export class RedisCacheStrategy implements CacheStrategy {
  private readonly keyv: Keyv;

  constructor() {
    this.keyv = new Keyv({
      store: new KeyvRedis(process.env.REDIS_URL),
    });
  }

  get<T>(key: string) {
    return this.keyv.get(key);
  }

  async set<T>(key: string, value: T, ttl?: number) {
    await this.keyv.set(key, value, ttl);
  }
}
