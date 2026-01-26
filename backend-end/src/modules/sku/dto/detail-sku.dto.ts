import { IsString } from 'class-validator';

export class DetailSkuDto {
  @IsString()
  id: string;
}
