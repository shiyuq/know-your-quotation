import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListSkuDto {
  @IsString()
  productId: string;
}
