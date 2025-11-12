import { AppConfig } from './configuration.type';
import { registerAs } from '@nestjs/config';

export default registerAs<AppConfig>('app', () => {
  return {
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
    env: process.env.NODE_ENV,
    currentApiKey: process.env.CURRENCY_API_KEY,
  };
});
