// kafka.module.ts

import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';

import { AllConfigType } from '@/config/config.type';
import { KafkaProducerService } from './services/kafka-producer.service';

// import { logLevel } from 'kafkajs';
// import { KafkaService } from './services/kafka.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_PRODUCER',
        imports: [ConfigModule], // 关键：让 ConfigService 可注入
        inject: [ConfigService],
        useFactory: (configService: ConfigService<AllConfigType>) => {
          const kafka = configService.getOrThrow('kafka', { infer: true });
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: kafka.clientId,
                brokers: kafka.brokers?.split(',')?.map((b) => b.trim()),
              },
              producerOnlyMode: true,
              producer: {
                retry: { retries: 5 },
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [KafkaProducerService],
  // ClientsModule 这里可以不用export，只有当其他模块需要用到原生 kafka 方法才需要导出
  exports: [
    // ClientsModule,
    KafkaProducerService,
  ], // 导出让其他模块能注入
})
export class KafkaModule {}
