import { BusinessException } from '../../filters/business-exception-filter';
import { ErrorCodeEnum } from '@/constants';

export class UserErrorHelper {
  // TODO模块
  static userNotExist(): never {
    throw new BusinessException(ErrorCodeEnum.USER_NOT_FOUND, '用户不存在');
  }

  static userPwdError(): never {
    throw new BusinessException(
      ErrorCodeEnum.USER_PWD_INCORRECT,
      '密码输入错误',
    );
  }

  static tenantNotExist(): never {
    throw new BusinessException(ErrorCodeEnum.TENANT_NOT_EXIST, '租户不存在');
  }
}
