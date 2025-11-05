import { CreateArticleInput } from '../dto/create-article.input';
import { Injectable } from '@nestjs/common';
import { UpdateArticleInput } from '../dto/update-article.input';

@Injectable()
export class ArticleService {
  create(createArticleInput: CreateArticleInput) {
    return 'This action adds a new article';
  }

  findAll() {
    return [
      {
        exampleField: 1,
        result: 'ok',
      },
      {
        exampleField: 2,
        result: 'ok',
      },
    ];
  }

  findOne(id: number, status: number) {
    return { exampleField: id };
  }

  update(id: number, updateArticleInput: UpdateArticleInput) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
