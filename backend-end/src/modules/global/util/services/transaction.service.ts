import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { txManagerALS, getTxManager } from '@/common/context/transaction-context';

@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) { }

  /** 总是开启一个新事务（很少需要） */
  async run<T>(fn: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) =>
      txManagerALS.run(manager, () => fn(manager)),
    );
  }

  /**
   * - 如果当前已经在事务中：复用当前事务
   * - 否则：开启新事务
   */
  async required<T>(fn: (manager: EntityManager) => Promise<T>): Promise<T> {
    const existing = getTxManager();
    if (existing) return fn(existing);
    return this.run(fn);
  }

  /** 给 Repository 用：拿当前 manager（可能为 undefined） */
  manager(): EntityManager | undefined {
    return getTxManager();
  }
}