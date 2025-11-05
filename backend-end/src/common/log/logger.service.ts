import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class StructuredLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context ?? ''); // 这里设置默认 context
  }

  private format(
    level: string,
    message: string,
    context?: string,
    meta?: Record<string, any>,
  ) {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || this.context,
      meta: meta || {},
      pid: process.pid,
      env: process.env.NODE_ENV || 'development',
      service: process.env.SERVICE_NAME || 'start-learn-nest',
    };
    return JSON.stringify(logObject);
  }

  log(message: string, context?: string, meta?: Record<string, any>) {
    console.log(this.format('info', message, context, meta));
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, any>,
  ) {
    console.error(this.format('error', message, context, { ...meta, trace }));
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    console.warn(this.format('warn', message, context, meta));
  }

  debug(message: string, context?: string, meta?: Record<string, any>) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(this.format('debug', message, context, meta));
    }
  }

  verbose(message: string, context?: string, meta?: Record<string, any>) {
    if (process.env.LOG_LEVEL === 'verbose') {
      console.log(this.format('verbose', message, context, meta));
    }
  }
}
