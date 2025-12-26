import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

import { AllConfigType } from '@/config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async onModuleInit() {
    const serviceName = this.configService.getOrThrow('app.serviceName', {
      infer: true,
    });

    this.kafka = new Kafka({
      clientId: serviceName,
      brokers: ['localhost:9092'], // 单节点
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('Kafka Producer connected');
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      console.log('Kafka Producer disconnected');
    }
  }

  // 发送消息方法
  async sendMessage(topic: string, message: any, key?: string) {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }

    const record: ProducerRecord = {
      topic,
      messages: [
        {
          key: key ?? null,
          value: JSON.stringify(message), // Kafka 消息通常是字符串或 Buffer
        },
      ],
    };

    await this.producer.send(record);
    console.log(`Message sent to topic ${topic}:`, message);
  }
}
