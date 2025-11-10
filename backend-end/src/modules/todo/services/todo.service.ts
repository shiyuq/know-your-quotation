import { CreateTodoDto } from '../dto/create-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Todo } from '@/database/entities';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { BusinessErrorHelper } from '@/common';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create(createTodoDto);
    return this.todoRepository.save(todo);
  }

  findAll(): Promise<Todo[]> {
    return this.todoRepository.find({ order: { updateTime: 'DESC' } });
  }

  findOne(id: number): Promise<Todo | null> {
    return this.todoRepository.findOneBy({ id });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const entity = await this.todoRepository.findOneBy({ id });
    if (!entity) {
      return BusinessErrorHelper.Todo.todoNotFound();
    }
    Object.assign(entity, updateTodoDto);
    return this.todoRepository.save(entity);
  }

  remove(id: number) {
    return `This action removes a #${id} todo`;
  }
}
