import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('KAFKA_PRODUCER')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    // console.log('Kafka Producer connected (NestJS official)');
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    // console.log('Kafka Producer disconnected');
  }

  /**
   * 发送消息（fire-and-forget 事件模式）
   * @param topic Kafka topic
   * @param message 消息内容（对象会自动 JSON.stringify）
   * @param key 可选 key，用于分区
   */
  async send(topic: string, message: any, key?: string) {
    return this.kafkaClient.emit(topic, {
      key: key ?? null,
      value: message, // Nest 会自动序列化
    });
  }

  /**
   * 如果需要 request-response 模式（同步等待响应）
   * 使用 send() 而不是 emit()
   */
  async sendWithResponse(topic: string, message: any, key?: string) {
    return this.kafkaClient.send(topic, [
      {
        key: key ?? null,
        value: message,
      },
    ]);
  }
}
