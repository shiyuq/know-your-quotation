import { BaseRepository } from './base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TenantEntity } from '../entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TenantRepository extends BaseRepository<TenantEntity> {
  protected tenantScoped = false;

  constructor(
    @InjectRepository(TenantEntity) repository: Repository<TenantEntity>,
    protected readonly dataSource?: DataSource,
  ) {
    super(repository, dataSource);
  }
}
