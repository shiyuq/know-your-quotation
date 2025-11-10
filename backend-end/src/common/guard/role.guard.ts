/**
 * deprecated: 已弃用，使用 auth.guard.ts 代替
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator/roles.decorator';
import _ from 'lodash';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if ((context.getType() as string) === 'graphql') return true;

    const roles = this.reflector.get(Roles, context.getHandler());
    if (_.isEmpty(roles)) {
      return true;
    }
    const request =
      (context.getType() as string) === 'graphql'
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest();
    const user = request.user;
    const userRoles = _.intersection(roles, user?.roles ?? []);
    return !_.isEmpty(userRoles);
  }
}
