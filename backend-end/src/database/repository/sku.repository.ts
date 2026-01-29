import { BaseRepository } from './base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SKUEntity } from '../entities';
import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@/constants';

interface ISkuListPaginationDto {
  productNo?: string;
  skuCode?: string;
  status?: ProductStatus;
  pageIndex: number;
  pageSize: number;
}

@Injectable()
export class SKURepository extends BaseRepository<SKUEntity> {
  protected tenantScoped = true;

  constructor(
    @InjectRepository(SKUEntity) repository: Repository<SKUEntity>,
    protected readonly dataSource?: DataSource,
  ) {
    super(repository, dataSource);
  }

  async getSkuListByPagination(
    dto: ISkuListPaginationDto,
  ): Promise<[SKUEntity[], number]> {
    const { productNo, skuCode, status, pageIndex, pageSize } = dto;
    const qb = this.createQueryBuilder('sku').innerJoinAndSelect(
      'sku.product',
      'product',
    );
    if (productNo) {
      qb.andWhere('product.name LIKE :name', { name: `%${productNo}%` });
    }
    if (skuCode) {
      qb.andWhere('sku.skuCode LIKE :skuCode', { skuCode: `%${skuCode}%` });
    }
    if (status !== undefined) {
      qb.andWhere('product.status = :status', { status });
    }
    qb.orderBy('sku.productId', 'DESC')
      .addOrderBy('sku.order', 'ASC')
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize);
    return qb.getManyAndCount();
  }
}
