import { BaseRepository } from './base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ImageEntity } from '../entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageRepository extends BaseRepository<ImageEntity> {
  protected tenantScoped = true;

  constructor(
    @InjectRepository(ImageEntity) repository: Repository<ImageEntity>,
    protected readonly dataSource?: DataSource,
  ) {
    super(repository, dataSource);
  }
}
