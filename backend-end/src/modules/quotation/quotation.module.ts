import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { QuotationController } from './controllers/quotation.controller';
import { QuotationService } from './services/quotation.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QuotationController],
  providers: [QuotationService],
})
export class QuotationModule {}
