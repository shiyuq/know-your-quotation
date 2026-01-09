import { AllConfigType } from '@/config/config.type';
import { CacheStrategy } from '../interface';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class RedisCacheStrategy implements CacheStrategy {
  private readonly keyv: Keyv;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const redis = this.configService.getOrThrow('redis', { infer: true });
    this.keyv = new Keyv({
      store: new KeyvRedis(`redis://${redis.host}:${redis.port}`),
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
