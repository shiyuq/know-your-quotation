import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class DetailTenantDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
