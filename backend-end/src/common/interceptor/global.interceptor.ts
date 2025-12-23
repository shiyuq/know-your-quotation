import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { INFRA_PATHS } from '@/constants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if ((context.getType() as string) === 'graphql') {
      return next.handle();
    } else {
      const req = context.switchToHttp().getRequest();
      // 🚨 跳过 Prometheus metrics
      if (INFRA_PATHS.includes(req.url)) {
        return next.handle();
      }
      return next.handle().pipe(
        map((data) => {
          // 在这里对正常返回的数据统一组装
          return {
            status: HttpStatus.OK,
            timestamp: Date.now(),
            data,
          };
        }),
      );
    }
  }
}
