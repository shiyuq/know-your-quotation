import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { GlobalRole, UserStatus } from '@/constants';

import moment from 'moment';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
  })
  tenantId: string;

  @Column({
    name: 'username',
  })
  username: string;

  @Column({
    name: 'password',
  })
  password: string;

  @Column({
    name: 'salt',
  })
  salt: string;

  @Column({
    name: 'phone',
  })
  phone: string;

  @Column({
    name: 'role',
  })
  role: GlobalRole;

  @Column({
    name: 'status',
  })
  status: UserStatus;

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
