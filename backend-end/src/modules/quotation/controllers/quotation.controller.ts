import { Body, Controller, Post, Request } from '@nestjs/common';
import { BusinessErrorHelper, Permisson } from '@/common';
import { MakeQuotationDto } from '../dto/make-quotation.dto';
import { PermissonEnum } from '@/constants';
import { QuotationService } from '../services/quotation.service';

@Controller('quotation')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post('make')
  @Permisson(PermissonEnum.makeQuotation)
  makeQuotation(@Body() dto: MakeQuotationDto) {
    return this.quotationService.makeQuotation(dto);
  }
}
