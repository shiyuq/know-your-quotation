import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
