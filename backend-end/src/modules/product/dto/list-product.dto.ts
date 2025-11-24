import { IsInt, Min } from 'class-validator';

export class ListProductDto {
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @IsInt()
  @Min(1)
  pageIndex: number = 1;
}
