import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { httpRequestDuration, httpRequestsTotal } from '@/constants';

import { tap } from 'rxjs';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    if ((context.getType() as string) === 'graphql') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<any>();
    const res = ctx.getResponse<any>();

    const start = process.hrtime.bigint();

    const method = req.method;
    const route = req.route?.path ?? 'unknown';
    const tenantId = req.user?.tenantId ?? 'unknown';

    return next.handle().pipe(
      tap({
        next: () => {
          const duration =
            Number(process.hrtime.bigint() - start) / 1_000_000_000;

          httpRequestsTotal.inc({
            method,
            route,
            status: res.statusCode,
            tenant_id: tenantId,
          });

          httpRequestDuration.observe(
            { method, route, tenant_id: tenantId },
            duration,
          );
        },
        error: () => {
          httpRequestsTotal.inc({
            method,
            route,
            status: 500,
            tenant_id: tenantId,
          });
        },
      }),
    );
  }
}
