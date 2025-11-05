import { Injectable, Ip, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { StructuredLogger } from '@/common';
import { randomUUID } from 'crypto';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new StructuredLogger(HttpLoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint(); // 纳秒级时间差
    const traceId = randomUUID();

    // 将 traceId 挂在请求对象上（方便下游日志打点用）
    (req as any).traceId = traceId;

    const safeBody = this.sanitizeBody(req.body);
    const safeQuery = req.query;

    // 请求日志
    this.logger.log(`Incoming request`, `${req.method} ${req.originalUrl}`, {
      traceId,
      request: {
        method: req.method,
        url: req.originalUrl,
        query: safeQuery,
        body: safeBody,
      },
      client: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // 等响应结束后打印结果日志
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000; // 纳秒转毫秒

      this.logger.log(`Request completed`, `${req.method} ${req.originalUrl}`, {
        traceId,
        request: {
          method: req.method,
          url: req.originalUrl,
          query: safeQuery,
          body: safeBody,
        },
        response: {
          statusCode: res.statusCode,
          duration: durationMs.toFixed(2),
        },
        client: {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    });

    next();
  }

  private sanitizeBody(body: any) {
    if (!body || typeof body !== 'object') return body;

    // 自动过滤常见敏感字段
    const blacklist = [
      'password',
      'token',
      'authorization',
      'secret',
      'refreshToken',
    ];
    const cloned = { ...body };

    for (const key of Object.keys(cloned)) {
      if (blacklist.includes(key.toLowerCase())) {
        cloned[key] = '[FILTERED]';
      }
    }

    return cloned;
  }
}
