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
import { SKURepository } from './repository/sku.repository';
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
  providers: [SKURepository],
  exports: [TypeOrmModule, MongooseModule, SKURepository], // 统一导出
})
export class DatabaseModule {}
