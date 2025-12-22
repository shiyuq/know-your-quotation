import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GlobalRole, RolePermissions, jwtConstants } from '@/constants';

import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Permisson } from '../decorator/permisson.decorator';
import { Public } from '../decorator/public.decorator';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import _ from 'lodash';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    // ✅ 放行 Prometheus metrics
    if (request.method === 'GET' && request.url === '/metrics') {
      return true;
    }

    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    // 获取用户信息，如果没有获取到，抛出异常
    const user: { role: GlobalRole } = request.user;

    // 如果是平台管理员，直接放行
    if (user.role === GlobalRole.PLATFORM_ADMIN) {
      if (request.url === '/product/leadin') {
        return true;
      }
      if (!request.body?.tenantId) {
        return false;
      }
      request.user.tenantId = request.body.tenantId;
      return true;
    }

    // 如果是普通用户，检查权限
    const permission = this.reflector.get(Permisson, context.getHandler());

    // 如果没有权限信息，直接放行
    if (!permission) return true;

    // 如果无权限，不放行
    if (!_.includes(RolePermissions[user.role], permission)) {
      return false;
    }

    return true;
  }

  private getRequest(context: ExecutionContext) {
    return (context.getType() as string) === 'graphql'
      ? GqlExecutionContext.create(context).getContext().req
      : context.switchToHttp().getRequest();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
