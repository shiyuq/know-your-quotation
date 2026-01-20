import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {
  RequestContext,
  requestContextALS,
} from '@/common/context/request-context';

import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '@/constants';

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    let payload: any = null;

    if (token) {
      try {
        payload = await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.secret,
        });
      } catch (e) {
        // token 无效不抛异常，交给 Guard 处理
      }
    }

    const ctx: RequestContext = this.buildContext(payload, req);

    requestContextALS.run(ctx, () => next());
  }

  private extractToken(req: Request): string | undefined {
    const auth = req.headers.authorization;
    if (!auth) return undefined;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private buildContext(payload: any, req: Request): RequestContext {
    const user = payload
      ? {
          userId: payload.sub || payload.userId,
          username: payload.username,
          role: payload.role,
          tenantId: payload.tenantId,
          tenantName: payload.name,
          status: payload.status,
          ...payload,
        }
      : {};

    let tenantId =
      user?.tenantId || (req.headers['x-tenant-id'] as string) || '';

    return {
      user,
      tenant: {
        tenantId,
        isActive: !!tenantId,
      },
      // 如果是抽象成基础微服务，可以将这里的 trace-id 和 request-id 放到 config 中
      traceId: (req.headers['x-trace-id'] as string) || crypto.randomUUID(),
      requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
      ip: req.ip,
    };
  }
}
