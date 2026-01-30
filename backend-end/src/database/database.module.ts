import {
  ImageEntity,
  ProductEntity,
  SKUEntity,
  TenantEntity,
  Todo,
  UserEntity,
} from './entities';
import { User, UserSchema } from './schemas';

import { ImageRepository } from './repository/image.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductRepository } from './repository/product.repository';
import { SKURepository } from './repository/sku.repository';
import { TenantRepository } from './repository/tenant.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/user.repository';

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
  providers: [
    SKURepository,
    UserRepository,
    ProductRepository,
    TenantRepository,
    ImageRepository,
  ],
  exports: [
    TypeOrmModule,
    MongooseModule,
    SKURepository,
    UserRepository,
    ProductRepository,
    TenantRepository,
    ImageRepository,
  ], // 统一导出
})
export class DatabaseModule {}
