import { CreateArticleInput } from './create-article.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateArticleInput extends PartialType(CreateArticleInput) {
  id: number;
}
