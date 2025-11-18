import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Transform } from 'class-transformer';
import moment from 'moment';

@Entity('tenant')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'tel',
  })
  tel: string;

  @Column({
    name: 'fax',
  })
  fax: string;

  @Column({
    name: 'address',
  })
  address: string;

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
