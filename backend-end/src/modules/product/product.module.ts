import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
