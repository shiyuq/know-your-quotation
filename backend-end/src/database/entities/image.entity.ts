import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ProductEntity } from './product.entity';
import { SKUEntity } from './sku.entity';
import { Transform } from 'class-transformer';
import moment from 'moment';

@Entity('image')
export class ImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'base64_data' })
  base64Data: string;

  @Column({ name: 'hash_data' })
  hashData: string;

  // 一对多：一个 Image 可以被多个 SKU 使用
  @OneToMany(() => SKUEntity, (sku) => sku.imageId)
  skus: SKUEntity[];

  // 一对多：一个 Image 可以被多个 product 使用
  @OneToMany(() => ProductEntity, (sku) => sku.imageId)
  products: ProductEntity[];

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
