import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  AllConfigType,
  appConfig,
  kafkaConfig,
  mongoConfig,
  mysqlConfig,
} from '@/config';
import {
  AllExceptionsFilter,
  AuthGuard,
  HttpLoggerMiddleware,
  LoggingInterceptor,
  MetricsInterceptor,
  SafeClassSerializerInterceptor,
  TransformInterceptor,
} from '@/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  ArticleModule,
  AuthModule,
  KafkaModule,
  ProductModule,
  QuotationModule,
  TodoModule,
  UsersModule,
  UtilModule,
} from '@/modules';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AppController } from './app.controller';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
// import { DevtoolsModule } from '@nestjs/devtools-integration';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '@/constants';

@Module({
  imports: [
    // 开发环境开启devtools，但是要收费，主要看依赖关系
    // DevtoolsModule.register({
    // http: process.env.NODE_ENV !== 'production',
    // http: true,
    // port: 9229,
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? []
          : [`.env.${process.env.NODE_ENV || 'development'}`],
      load: [appConfig, mysqlConfig, mongoConfig, kafkaConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const mysql = configService.getOrThrow('mysql', { infer: true });
        return {
          ...mysql,
          type: 'mysql',
          // entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const mongo = configService.getOrThrow('mongo', { infer: true });
        return {
          uri: mongo.uri,
        };
      },
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'], // 指定 schema 文件路径
      playground: false,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        base: {},
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              },
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            query: req.query,
            body: req.body,
            userId: req.user?.sub,
            tenantId: req.user?.tenantId,
            traceId: req.traceId,
          }),
        },
        redact: ['req.headers.authorization', 'req.body.password'],
        autoLogging: false,
      },
    }),
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const app = configService.getOrThrow('app', { infer: true });
        return {
          path: '/metrics',
          defaultLabels: {
            app: app.serviceName,
          },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis('redis://localhost:6380'),
          ],
        };
      },
    }),
    TodoModule,
    AuthModule,
    UsersModule,
    ArticleModule,
    UtilModule,
    ProductModule,
    QuotationModule,
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: false,
          disableErrorMessages: false,
        });
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SafeClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(HttpLoggerMiddleware).forRoutes('*'); // 对所有路由生效
  // }
}
