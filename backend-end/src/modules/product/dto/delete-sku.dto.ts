import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class DeleteSkuDto {
  @IsString()
  skuCode: string;
}
