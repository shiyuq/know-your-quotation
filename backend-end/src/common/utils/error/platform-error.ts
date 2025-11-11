import { BusinessException } from '../../filters/business-exception-filter';
import { ErrorCodeEnum } from '@/constants';

export class PlatformErrorHelper {
  static tenantIdRequired(): never {
    throw new BusinessException(
      ErrorCodeEnum.TENANT_ID_REQUIRED,
      'TENANT ID为必填项',
    );
  }
}
