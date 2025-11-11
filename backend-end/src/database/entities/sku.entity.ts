import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ProductStatus } from '@/constants';
import { Transform } from 'class-transformer';
import moment from 'moment';

@Entity('sku')
export class SKUEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'sku_code' })
  skuCode: string;

  @Column({ name: 'desc' })
  desc: string;

  @Column({ name: 'image_id' })
  imageId: string;

  @Column({ name: 'unit_price' })
  unitPrice: number;

  @Column({ name: 'unit' })
  unit: string;

  @Column({ name: 'status' })
  status: ProductStatus;

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
