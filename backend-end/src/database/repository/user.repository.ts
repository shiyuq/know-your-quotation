import { BaseRepository } from './base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  protected tenantScoped = false;

  constructor(
    @InjectRepository(UserEntity) repository: Repository<UserEntity>,
    protected readonly dataSource?: DataSource,
  ) {
    super(repository, dataSource);
  }
}
