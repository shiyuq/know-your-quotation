import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  public readonly code: number;

  constructor(code: number, message: string) {
    // 保持 HTTP 200，前端通过 code 判断业务结果
    super({ code, message }, HttpStatus.OK);
    this.code = code;
  }
}
