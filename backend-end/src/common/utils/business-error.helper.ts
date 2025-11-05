import { BusinessException } from '../filters/business-exception-filter';
import { TodoErrorCode } from '@/constants';

export class BusinessErrorHelper {
  // TODO模块
  static todoNotFound(): never {
    throw new BusinessException(TodoErrorCode.TODO_NOT_FOUND, 'TODO不存在');
  }

  // 可扩展：通用方法
  static throw(code: number, message: string): never {
    throw new BusinessException(code, message);
  }
}
