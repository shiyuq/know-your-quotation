import { BaseRepository } from './base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TenantEntity } from '../entities';
import { Injectable } from '@nestjs/common';

interface IPaginationDto {
  companyName?: string;
  valid?: boolean;
  pageIndex: number;
  pageSize: number;
}

@Injectable()
export class TenantRepository extends BaseRepository<TenantEntity> {
  protected tenantScoped = false;

  constructor(
    @InjectRepository(TenantEntity) repository: Repository<TenantEntity>,
    protected readonly dataSource?: DataSource,
  ) {
    super(repository, dataSource);
  }

  async getTenantListByPagination(
    dto: IPaginationDto,
  ): Promise<[TenantEntity[], number]> {
    const { companyName, valid, pageIndex, pageSize } = dto;
    const qb = this.createQueryBuilder('tenant');
    if (companyName) {
      qb.andWhere('tenant.name LIKE :companyName', {
        companyName: `%${companyName}%`,
      });
    }
    if (valid !== undefined) {
      qb.andWhere('tenant.valid = :valid', { valid });
    }
    qb.orderBy('tenant.createTime', 'DESC')
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize);
    return qb.getManyAndCount();
  }
}
