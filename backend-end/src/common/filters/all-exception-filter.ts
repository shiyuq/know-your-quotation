import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BusinessException } from './business-exception-filter';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    let code = 50000;
    let message = '系统异常，请稍后重试';
    let status = 500;

    if (exception instanceof BusinessException) {
      code = exception.code;
      message = (exception.getResponse() as any).message;
      status = 200; // 业务异常统一返回 200
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      // 支持你自定义 code 或使用默认 HTTP 状态码
      code = res?.code ?? status;
      // 消息优先使用 response.message，如果是 ValidationPipe 抛出的数组则 join
      if (Array.isArray(res?.message)) {
        message = res.message.join(', ');
      } else {
        message = res?.message ?? exception.message;
      }

      // 参数校验错误统一映射到你的业务错误码 10001
      if (status === 400) {
        status = 200;
        code = 10001;
        message = Array.isArray(res?.message)
          ? res.message.join(', ')
          : '参数校验失败';
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    if ((host.getType() as string) !== 'graphql') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      response.status(status).json({
        status: code,
        message,
        data: null,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      const gqlHost = GqlArgumentsHost.create(host);
      return new GraphQLError(message, {
        extensions: {
          status: code,
          message,
          data: null,
          timestamp: new Date().toISOString(),
          path: gqlHost.getInfo().path.key, // 出错的字段名
        },
      });
    }
  }
}
