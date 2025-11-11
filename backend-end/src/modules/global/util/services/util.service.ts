import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import sharp from 'sharp';

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

  async generateHash(buffer: Buffer): Promise<string> {
    const resized = await sharp(buffer)
      .resize({
        height: 100, // 固定高度为100
        fit: 'contain', // 按比例缩放，不拉伸
        withoutEnlargement: false, // 不限制放大/缩小，统一处理
      })
      .png() // 转换成稳定格式，避免 jpg、png 差异导致 hash 不一致
      .toBuffer();
    return crypto.createHash('sha256').update(resized).digest('hex');
  }
}
