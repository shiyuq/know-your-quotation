import {
  DataSource,
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { Injectable } from '@nestjs/common';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { getCurrentTenantOrThrow } from '@/common/context/request-context';
import { getTxManager } from '@/common/context/transaction-context';

@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly dataSource?: DataSource,
  ) {}

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

  async save(entity: T): Promise<T>;
  async save(entities: T[]): Promise<T[]>;
  async save(entityOrEntities: T | T[]): Promise<T | T[]> {
    return this.getRepo().save(entityOrEntities as any);
  }

  create(entity: Partial<T>): T;
  create(entities: Partial<T>[]): T[];
  create(entityOrEntities: Partial<T> | Partial<T>[]): T | T[] {
    return this.getRepo().create(entityOrEntities as any);
  }

  async delete(criteria: any) {
    return this.getRepo().delete(criteria);
  }

  async remove(entity: T): Promise<T>;
  async remove(entities: T[]): Promise<T[]>;
  async remove(entityOrEntities: T | T[]): Promise<T | T[]> {
    return this.getRepo().remove(entityOrEntities as any);
  }

  async update(criteria: any, entity: Partial<T>): Promise<any> {
    const repo = this.getRepo();
    return repo.update(criteria, entity);
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

  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    const filteredWhere = this.applyTenantFilter(where);
    if (!filteredWhere) {
      return this.getRepo().findOneBy(where);
    }
    return this.getRepo().findOneBy(filteredWhere as FindOptionsWhere<T>);
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
