import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Transform } from 'class-transformer';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || '123456')
  initPwd: string;
}
