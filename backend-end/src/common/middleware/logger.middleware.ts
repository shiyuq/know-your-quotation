import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { StructuredLogger } from '@/common';
import { randomUUID } from 'crypto';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new StructuredLogger(HttpLoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint(); // 纳秒级时间差
    const traceId = randomUUID();

    // 将 traceId 挂在请求对象上（方便下游日志打点用）
    (req as any).traceId = traceId;

    const safeBody = this.sanitizeBody(req.body) || {};
    const safeQuery = req.query || {};

    // 请求日志，prod环境才打日志
    // 等响应结束后打印结果日志
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000; // 纳秒转毫秒

      if (this.configService.get('app.env') !== 'production') {
        this.logger.log(
          `Request completed`,
          `${req.method} ${req.originalUrl}`,
          {
            traceId,
            tenantId: (req as any).user?.tenantId || '',
            userId: (req as any).user?.sub || '',
            request: {
              method: req.method,
              url: req.originalUrl,
              query: JSON.stringify(safeQuery),
              body: JSON.stringify(safeBody),
            },
            response: {
              statusCode: res.statusCode,
              duration: durationMs.toFixed(2),
            },
            client: {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
            },
          },
        );
      }
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
