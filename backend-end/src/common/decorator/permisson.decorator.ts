import { PermissonEnum } from '@/constants';
import { Reflector } from '@nestjs/core';

// 自动推断成 Role[] 类型
export const Permisson = Reflector.createDecorator<PermissonEnum>();
