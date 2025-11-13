import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ProductStatus } from '@/constants';
import { SKUEntity } from './sku.entity';
import { Transform } from 'class-transformer';
import moment from 'moment';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'desc' })
  desc: string;

  @Column({ name: 'status' })
  status: ProductStatus;

  // 一对多关系
  @OneToMany(() => SKUEntity, (sku) => sku.productId)
  skus: SKUEntity[];

  @Transform(({ value }) => moment(value).format('YYYY-MM-DD HH:mm:ss'), {
    toPlainOnly: true,
  })
  @Column({
    name: 'create_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;

  @Transform(({ value }) => moment(value).format('YYYY-MM-DD HH:mm:ss'), {
    toPlainOnly: true,
  })
  @Column({
    name: 'update_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateTime: Date;
}
