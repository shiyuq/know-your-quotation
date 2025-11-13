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

  @Column({ name: 'attribute_value', nullable: true })
  attributeValue: number;

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

  // 多对一关系：SKU → Product
  @ManyToOne(() => ProductEntity, (product) => product.skus)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  // 多对一关系：SKU → Image
  @ManyToOne(() => ImageEntity, (image) => image.skus)
  @JoinColumn({ name: 'image_id' })
  image: ImageEntity;

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
