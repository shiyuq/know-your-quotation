import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { TodoStatus } from '@/database/entities';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  @IsEnum(TodoStatus)
  status?: TodoStatus; // 1=未完成, 2=完成
}
