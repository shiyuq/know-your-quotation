import { User, UserSchema } from './schemas';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  exports: [TypeOrmModule, MongooseModule], // 统一导出
})
export class DatabaseModule {}
