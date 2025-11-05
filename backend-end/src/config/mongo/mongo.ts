import { MongoConfig } from './mongo.type';
import { registerAs } from '@nestjs/config';

export default registerAs<MongoConfig>('mongo', () => {
  return {
    uri: process.env.MONGO_URI,
  };
});
