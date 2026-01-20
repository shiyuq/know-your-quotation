import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { ProductStatus } from '@/constants';

export class ListSkuDto {
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @IsInt()
  @Min(1)
  pageIndex: number = 1;

  @IsString()
  @IsOptional()
  productNo?: string;

  @IsString()
  @IsOptional()
  skuCode?: string;

  @IsInt()
  @IsOptional()
  status?: ProductStatus;
}
