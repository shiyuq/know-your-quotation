import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<any>();
    const res = ctx.getResponse<any>();

    // 生成 traceId 并挂到请求上
    const traceId = randomUUID();
    req.traceId = traceId;

    // 开始计时
    const startTime = process.hrtime.bigint();

    return next.handle().pipe(
      tap((responseBody) => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        // 脱敏请求 body
        const safeRequestBody = this.sanitize(req.body);

        // 根据业务 code 决定日志等级
        let level: 'info' | 'warn' | 'error' = 'info';
        const bizCode = responseBody?.code ?? 0;
        if (bizCode !== 0 && bizCode < 50000) level = 'warn';
        if (bizCode >= 50000) level = 'error';

        // 打日志
        req.log[level](
          {
            traceId,
            userId: req.user?.sub,
            tenantId: req.user?.tenantId,
            request: {
              method: req.method,
              url: req.originalUrl,
              query: req.query,
              body: safeRequestBody,
            },
            response: {
              statusCode: res.statusCode,
              durationMs,
            },
            client: {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
            },
          },
          'HTTP request completed',
        );
      }),
    );
  }

  private sanitize(obj: any) {
    if (!obj || typeof obj !== 'object') return obj;

    const clone = { ...obj };
    const blacklist = [
      'password',
      'token',
      'authorization',
      'secret',
      'refreshToken',
    ];
    for (const key of Object.keys(clone)) {
      if (blacklist.includes(key.toLowerCase())) {
        clone[key] = '[FILTERED]';
      } else if (typeof clone[key] === 'object') {
        clone[key] = this.sanitize(clone[key]);
      }
    }

    // 可选裁剪，防止大对象
    try {
      const str = JSON.stringify(clone);
      if (str.length > 2000) return str.slice(0, 2000) + '...[TRUNCATED]';
    } catch (e) {
      return '[UNSERIALIZABLE]';
    }

    return clone;
  }
}
