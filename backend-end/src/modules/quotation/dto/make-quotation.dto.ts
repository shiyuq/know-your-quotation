import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class ProductItemDto {
  @IsString()
  skuCode: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class MakeQuotationDto {
  @IsUUID()
  @IsOptional()
  customerId: string = 'd4027712-4a88-4770-96cc-4eae2b14fe51';

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}
