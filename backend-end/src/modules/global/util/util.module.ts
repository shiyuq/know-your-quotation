// util.module.ts

import { Global, Module } from '@nestjs/common';

import { UtilService } from './services/util.service';
import { TransactionService } from './services/transaction.service';

@Global() // 关键点：全局模块
@Module({
  providers: [UtilService, TransactionService],
  exports: [UtilService, TransactionService], // 导出让其他模块能注入
})
export class UtilModule { }
