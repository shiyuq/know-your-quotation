import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GlobalRole, RolePermissions } from '@/constants';
import {
  RequestContext,
  getCurrentCtx,
} from '@/common/context/request-context';

import { GqlExecutionContext } from '@nestjs/graphql';
import { Permisson } from '../decorator/permisson.decorator';
import { Public } from '../decorator/public.decorator';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import _ from 'lodash';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = this.getRequest(context);

    // 放行 Prometheus metrics
    if (request.method === 'GET' && request.url === '/metrics') {
      return true;
    }

    // 公共路由放开
    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }

    const ctx: RequestContext = getCurrentCtx();

    // 缺乏用户信息放开
    if (_.isEmpty(ctx.user)) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (ctx.user.role === GlobalRole.PLATFORM_ADMIN) {
      // 这里后续要注意，如果是代租户操作的话，需要拿 x-tenant-id 和 redis 暂存的数据对比
      return true;
    }

    // 任何操作都需要带 tenantId
    if (!ctx.user.tenantId || !ctx.tenant.tenantId) return false;

    // 如果不是管理员但是操作了其他租户
    if (ctx.user.tenantId !== ctx.tenant.tenantId) return false;

    const permission = this.reflector.get(Permisson, context.getHandler());
    if (!permission) return true;

    if (!_.includes(RolePermissions[ctx.user.role], permission)) return false;

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return (context.getType() as string) === 'graphql'
      ? GqlExecutionContext.create(context).getContext().req
      : context.switchToHttp().getRequest();
  }
}
