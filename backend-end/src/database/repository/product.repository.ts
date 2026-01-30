import { BaseRepository } from './base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductEntity } from '../entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity> {
  protected tenantScoped = true;

  constructor(
    @InjectRepository(ProductEntity) repository: Repository<ProductEntity>,
    protected readonly dataSource?: DataSource,
  ) {
    super(repository, dataSource);
  }
}
