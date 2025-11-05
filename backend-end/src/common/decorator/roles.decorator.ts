import { Reflector } from '@nestjs/core';
import { Role } from '@/constants';

// 自动推断成 Role[] 类型
export const Roles = Reflector.createDecorator<Role[]>();
