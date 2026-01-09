import { RedisConfig } from './redis.type';
import { registerAs } from '@nestjs/config';

export default registerAs<RedisConfig>('redis', () => {
  return {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ?? '6380',
  };
});
