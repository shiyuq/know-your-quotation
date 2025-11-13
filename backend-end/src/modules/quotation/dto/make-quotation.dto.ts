import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class ProductItemDto {
  @IsString()
  skuCode: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class MakeQuotationDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}
