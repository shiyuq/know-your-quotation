import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';

// import { Todo } from '../../database/entities/todo.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [DatabaseModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
