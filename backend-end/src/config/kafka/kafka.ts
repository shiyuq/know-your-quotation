import { KafkaConfig } from './kafka.type';
import { registerAs } from '@nestjs/config';

export default registerAs<KafkaConfig>('kafka', () => {
  return {
    topic: process.env.KAFKA_TOPIC,
    clientId: process.env.KAFKA_CLIENT_ID,
    groupId: process.env.KAFKA_GROUP_ID,
    brokers: process.env.KAFKA_BROKERS ?? '',
  };
});
