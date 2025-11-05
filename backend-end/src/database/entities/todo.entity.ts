import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';

import moment from 'moment';

export enum TodoStatus {
  TODO = 1,
  DONE = 2,
}

@Entity('todo')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 1,
  })
  status: number;

  @Exclude()
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

  // @Expose() 修饰的属性会出现在响应结果中
  @Expose()
  get statusName(): string {
    return this.status === TodoStatus.DONE ? '已完成' : '未完成';
  }
}
