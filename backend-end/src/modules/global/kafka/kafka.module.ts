// kafka.module.ts

import { ClientsModule, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';

import { KafkaProducerService } from './services/kafka-producer.service';
import { logLevel } from 'kafkajs';

// import { KafkaService } from './services/kafka.service';

@Global() // 关键点：全局模块
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER', // 注入 token
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nest-producer', // 可从 config 读取
            brokers: ['localhost:9092', 'localhost:9192', 'localhost:9292'], // 单节点
            // logLevel: logLevel.DEBUG,
            // 多节点示例：['localhost:9092', 'localhost:9093', 'localhost:9094']
          },
          producerOnlyMode: true, // 只作为生产者，不启动消费者
          // 可选：生产者配置（重试、超时等）
          producer: {
            retry: { retries: 5 },
            // 如果想关闭分区器警告，可加环境变量 KAFKAJS_NO_PARTITIONER_WARNING=1
          },
        },
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [ClientsModule, KafkaProducerService], // 导出让其他模块能注入
})
export class KafkaModule {}
