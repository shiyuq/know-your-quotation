import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListProductDto {
  @IsInt()
  @Min(1)
  pageSize: number = 5;

  @IsString()
  @IsOptional()
  productNo?: string;
}
