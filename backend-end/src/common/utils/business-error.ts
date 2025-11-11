// business-error.ts

import { BusinessException } from '../filters/business-exception-filter';
import { PlatformErrorHelper } from './error/platform-error';
import { TodoErrorHelper } from './error/todo-error';
import { UserErrorHelper } from './error/user-error';

export class BusinessErrorHelper {
  static readonly Todo = TodoErrorHelper;
  static readonly User = UserErrorHelper;
  static readonly Platform = PlatformErrorHelper;

  static throw(code: number, message: string): never {
    throw new BusinessException(code, message);
  }
}
