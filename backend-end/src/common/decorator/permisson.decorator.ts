import { PermissonEnum } from '@/constants';
import { Reflector } from '@nestjs/core';

export interface PermissionMeta {
  permission: PermissonEnum;
  requireTenant?: boolean;
}

export const PERMISSION_KEY = 'permission';

// 自动推断成 Role[] 类型
export const Permisson = Reflector.createDecorator<PermissionMeta>();
