import { IsOptional, IsString } from 'class-validator';

import { DetailTenantDto } from './detail-tenant.dto';
import { Expose } from 'class-transformer';

export class UpdateTenantDto extends DetailTenantDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  tel?: string;

  @IsString()
  @IsOptional()
  fax?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  shortAddress?: string;

  @IsString()
  @IsOptional()
  bank?: string;

  @IsString()
  @IsOptional()
  bankAddress?: string;

  @IsString()
  @IsOptional()
  swiftCode?: string;

  @IsString()
  @IsOptional()
  accountNo?: string;
}
