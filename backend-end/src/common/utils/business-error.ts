// business-error.ts

import { BusinessException } from '../filters/business-exception-filter';
import { TodoErrorHelper } from './error/todo-error';
import { UserErrorHelper } from './error/user-error';

export class BusinessErrorHelper {
  static Todo = TodoErrorHelper;
  static User = UserErrorHelper;

  static throw(code: number, message: string): never {
    throw new BusinessException(code, message);
  }
}
