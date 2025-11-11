import {
  ImageEntity,
  ProductEntity,
  SKUEntity,
  TenantEntity,
  Todo,
  UserEntity,
} from './entities';
import { User, UserSchema } from './schemas';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Todo,
      UserEntity,
      TenantEntity,
      ProductEntity,
      SKUEntity,
      ImageEntity,
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  exports: [TypeOrmModule, MongooseModule], // 统一导出
})
export class DatabaseModule {}
