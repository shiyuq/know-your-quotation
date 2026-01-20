import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PricingType, ProductStatus } from '@/constants';

import { ImageEntity } from './image.entity';
import { ProductEntity } from './product.entity';
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

  @Column({ name: 'pricing_type' })
  pricingType: PricingType;

  @Column('decimal', { name: 'attribute_value', nullable: true })
  attributeValue: number;

  @Column({ name: 'desc' })
  desc: string;

  @Column({ name: 'order' })
  order: number;

  @Column('decimal', { name: 'unit_price', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'unit' })
  unit: string;

  @Column('decimal', { name: 'weight', precision: 10, scale: 2 })
  weight: number;

  @Column('decimal', { name: 'length', precision: 10, scale: 2 })
  length: number;

  @Column('decimal', { name: 'width', precision: 10, scale: 2 })
  width: number;

  @Column('decimal', { name: 'height', precision: 10, scale: 2 })
  height: number;

  @Column({ name: 'status' })
  status: ProductStatus;

  // 多对一关系：SKU → Product
  @ManyToOne(() => ProductEntity, (product) => product.skus)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

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
