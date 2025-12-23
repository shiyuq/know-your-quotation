import {
  ClassSerializerInterceptor,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { INFRA_PATHS } from '@/constants';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class SafeClassSerializerInterceptor extends ClassSerializerInterceptor {
  intercept(context: ExecutionContext, next: any): Observable<any> {
    if ((context.getType() as string) === 'http') {
      const req = context.switchToHttp().getRequest<Request>();
      if (INFRA_PATHS.includes(req.url)) {
        return next.handle(); // 原样返回，不做序列化
      }
    }
    return super.intercept(context, next); // 默认行为
  }
}
