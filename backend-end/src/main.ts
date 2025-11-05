import { AllConfigType } from './config/config.type';
// import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
// import { ConsoleLogger } from '@nestjs/common';
// import { AllExceptionsFilter } from './exceptionFilter/all-exception-filter';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
// import { Reflector } from '@nestjs/core';
import { StructuredLogger, HttpLoggerMiddleware } from '@/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    snapshot: true,
    bufferLogs: true,
    logger: new StructuredLogger(),
  });
  // 跨域配置
  // app.enableCors();

  // 全局中间件
  // logger日志中间件
  // app.use(new HttpLoggerMiddleware());
  // helmet 中间件，设置各种 HTTP 头，防止一些已知的攻击，兼容apollo/server
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  // 全局异常过滤器
  // 可以放到 AppModule 里提供，也可以像下面这样全局使用
  // 但是放到 AppModule 里提供的话，依赖注入会更方便一些
  // app.useGlobalFilters(new AllExceptionsFilter());

  // 全局管道
  // 可以放到 AppModule 里提供，也可以像下面这样全局使用
  // 但是放到 AppModule 里提供的话，依赖注入会更方便一些
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: false, // 自动转换类型，比如get请求的字符串 '1' 转换为数字 1
  //     disableErrorMessages: false, // 生产环境建议设置为 true
  //     whitelist: true, // 删除非白名单属性
  //     forbidNonWhitelisted: false, // true 报错，false 删除非白名单属性
  //   }),
  // );

  /**
   * @Exclude() 装饰器修饰的属性不会出现在响应结果中
   * 可以放到 AppModule 里提供，也可以像下面这样全局使用
   * 但是放到 AppModule 里提供的话，依赖注入会更方便一些
   * 1. 可以在类上使用 @UseInterceptors(ClassSerializerInterceptor)
   * 2. 可以在方法上使用 @UseInterceptors(ClassSerializerInterceptor)
   * 3. 也可以全局使用 app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
   * 推荐使用第三种方式，全局使用，这样就不需要在每个类或方法上使用了
   */
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService<AllConfigType>);
  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
bootstrap();
