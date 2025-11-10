import { BusinessException } from '../../filters/business-exception-filter';
import { ErrorCodeEnum } from '@/constants';

export class TodoErrorHelper {
  // TODO模块
  static todoNotFound(): never {
    throw new BusinessException(ErrorCodeEnum.TODO_NOT_FOUND, 'TODO不存在');
  }
}
