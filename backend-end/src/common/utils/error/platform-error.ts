import { BusinessException } from '../../filters/business-exception-filter';
import { ErrorCodeEnum } from '@/constants';

export class PlatformErrorHelper {
  static tenantIdRequired(): never {
    throw new BusinessException(
      ErrorCodeEnum.TENANT_ID_REQUIRED,
      'TENANT ID为必填项',
    );
  }

  static fileAndImageCountNotMatch(): never {
    throw new BusinessException(
      ErrorCodeEnum.FILE_AND_IMAGE_COUNT_NOT_MATCH,
      '图片数量和产品数量不匹配',
    );
  }
}
