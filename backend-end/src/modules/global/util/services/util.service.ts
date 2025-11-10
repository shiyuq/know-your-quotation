import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class UtilService {
  checkIsValidPwd(pwd: string, salt: string, hashedPwd: string): boolean {
    const derived = crypto
      .pbkdf2Sync(pwd, salt, 100_000, 64, 'sha256')
      .toString('hex');
    return derived === hashedPwd;
  }

  generatePwd(pwd: string): { salt: string; hashedPwd: string } {
    const salt = crypto.randomUUID();
    const derived = crypto
      .pbkdf2Sync(pwd, salt, 100_000, 64, 'sha256')
      .toString('hex');
    return { salt, hashedPwd: derived };
  }
}
