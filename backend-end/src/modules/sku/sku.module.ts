import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { SKUController } from './controllers/sku.controller';
import { SKUService } from './services/sku.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SKUController],
  providers: [SKUService],
})
export class SKUModule {}
