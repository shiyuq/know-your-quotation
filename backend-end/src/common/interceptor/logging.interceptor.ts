import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { AllConfigType } from '@/config';
import { ConfigService } from '@nestjs/config';
import { KafkaProducerService } from '@/modules/global/kafka/services/kafka-producer.service';
import { getCurrentCtx } from '@/common/context/request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.appInfo = this.configService.getOrThrow('app', { infer: true });
    this.kafkaInfo = this.configService.getOrThrow('kafka', { infer: true });
  }

  private readonly appInfo;
  private readonly kafkaInfo;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<any>();
    const res = ctx.getResponse<any>();

    // 开始计时
    const startTime = process.hrtime.bigint();
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      tap((responseBody) => {
        this.logSuccess(req, res, responseBody, startTime, timestamp);
      }),
      catchError((err) => {
        this.logError(req, res, err, startTime, timestamp);
        return throwError(() => err);
      }),
    );
  }

  private logSuccess(
    req: any,
    res: any,
    responseBody: any,
    startTime: bigint,
    timestamp: string,
  ) {
    const ctx = getCurrentCtx();
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    const safeRequestBody = this.sanitize(req.body);

    let level: 'info' | 'warn' | 'error' = 'info';
    const bizCode = responseBody?.code ?? 0;
    if (bizCode !== 0 && bizCode < 50000) level = 'warn';
    if (bizCode >= 50000) level = 'error';

    const logInfo = {
      env: this.appInfo.env,
      appName: this.appInfo.serviceName,
      timestamp,
      requestId: ctx.requestId,
      traceId: ctx.traceId,
      userId: ctx.user?.userId,
      tenantId: ctx.tenant?.tenantId,
      level,
      type: 'success',
      request: {
        method: req.method,
        url: req.originalUrl,
        query: JSON.stringify(req.query),
        body: safeRequestBody,
      },
      response: {
        statusCode: res.statusCode,
        durationMs,
        // body: responseBody, // 可选：是否记录响应体
      },
      client: {
        ip: ctx.ip,
        userAgent: req.headers['user-agent'],
      },
    };

    this.sendLogToKafka(logInfo);
    req.log[level](logInfo, 'HTTP request completed');
  }

  private logError(
    req: any,
    res: any,
    err: any,
    startTime: bigint,
    timestamp: string,
  ) {
    const ctx = getCurrentCtx();
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    const safeRequestBody = this.sanitize(req.body);

    const statusCode = err?.status || res?.statusCode || 500;
    const errorMessage = err?.message || 'Unknown error';
    const stack =
      process.env.NODE_ENV === 'development' ? err?.stack : undefined;

    const logInfo = {
      env: this.appInfo.env,
      appName: this.appInfo.serviceName,
      timestamp,
      requestId: ctx.requestId,
      traceId: ctx.traceId,
      userId: ctx.user?.userId,
      tenantId: ctx.tenant?.tenantId,
      level: 'error' as const,
      type: 'error',
      request: {
        method: req.method,
        url: req.originalUrl,
        query: JSON.stringify(req.query),
        body: safeRequestBody,
      },
      error: {
        statusCode,
        message: errorMessage,
        stack,
      },
      response: {
        durationMs,
      },
      client: {
        ip: ctx.ip,
        userAgent: req.headers['user-agent'],
      },
    };

    this.sendLogToKafka(logInfo);
    req.log.error(logInfo, 'HTTP request failed');
  }

  private sanitize(obj: any) {
    if (!obj || typeof obj !== 'object') {
      return obj === undefined ? '' : String(obj);
    }

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
      let str = JSON.stringify(clone);
      if (str.length > 2000) return str.slice(0, 2000) + '...[TRUNCATED]';
      return str;
    } catch (e) {
      return '[UNSERIALIZABLE]';
    }
  }

  private async sendLogToKafka(log: any) {
    try {
      const topic = this.kafkaInfo.topic ?? 'logs';
      await this.kafkaProducer.send(topic, log, ''); // topic 名称可配置
    } catch (error) {
      // Kafka 发送失败不要影响主流程，只打印控制台
      console.error('Failed to send log to Kafka:', error);
    }
  }
}
