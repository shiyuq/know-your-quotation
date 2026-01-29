import {
  DataSource,
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { Injectable } from '@nestjs/common';
import { getCurrentTenantOrThrow } from '@/common/context/request-context';
import { getTxManager } from '@/common/context/transaction-context';

@Injectable()
export abstract class BaseRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly dataSource?: DataSource,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  protected tenantScoped = true;

  /**
   * 获取当前租户ID
   */
  protected getCurrentTenantId(): string | undefined {
    if (!this.tenantScoped) {
      return undefined;
    }

    const tenant = getCurrentTenantOrThrow();
    return tenant.tenantId;
  }

  /**
   * 为查询条件添加租户范围限制
   */
  protected applyTenantFilter(
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined {
    if (!this.tenantScoped) {
      return where;
    }

    const filter = {
      tenantId: this.getCurrentTenantId(),
    } as FindOptionsWhere<T>;

    if (!where) {
      return filter;
    }

    if (Array.isArray(where)) {
      return where.map((w) => ({ ...w, ...filter }));
    }

    return { ...where, ...filter };
  }

  /**
   * 获取 Repository（自动支持事务）
   * 优先使用事务中的 manager，如果没有则使用普通 repository
   */
  protected getRepo(manager?: EntityManager): Repository<T> {
    // 如果显式传入了 manager，使用它
    if (manager) {
      return manager.getRepository(this.repository.target);
    }

    // 如果没有传入，尝试从上下文获取
    const contextManager = getTxManager();
    if (contextManager) {
      return contextManager.getRepository(this.repository.target);
    }

    // 都不存在，使用普通 repository
    return this.repository;
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.getRepo().find({
      ...options,
      where: this.applyTenantFilter(options?.where),
    });
  }

  async findOne(options?: FindManyOptions<T>): Promise<T | null> {
    return this.getRepo().findOne({
      ...options,
      where: this.applyTenantFilter(options?.where),
    });
  }

  createQueryBuilder(alias?: string) {
    const qb = this.getRepo().createQueryBuilder(alias);
    if (!this.tenantScoped) return qb;
    qb.where(`${alias || this.repository.metadata.name}.tenantId = :tenantId`, {
      tenantId: this.getCurrentTenantId(),
    });
    return qb;
  }
}
