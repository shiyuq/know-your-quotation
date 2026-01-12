import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { Transform } from 'class-transformer';

export class ListTenantDto {
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @IsInt()
  @Min(1)
  pageIndex: number = 1;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsBoolean()
  @IsOptional()
  valid?: boolean;
}
