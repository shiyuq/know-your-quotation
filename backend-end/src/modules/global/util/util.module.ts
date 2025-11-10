// util.module.ts

import { Global, Module } from '@nestjs/common';

import { UtilService } from './services/util.service';

@Global() // 关键点：全局模块
@Module({
  providers: [UtilService],
  exports: [UtilService], // 导出让其他模块能注入
})
export class UtilModule {}
