import { ParseIntPipe } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ArticleService } from '../services/article.service';
import { CreateArticleInput } from '../dto/create-article.input';
import { UpdateArticleInput } from '../dto/update-article.input';

@Resolver('Article')
export class ArticleResolver {
  constructor(private readonly articleService: ArticleService) {}

  @Mutation('createArticle')
  create(@Args('createArticleInput') createArticleInput: CreateArticleInput) {
    return this.articleService.create(createArticleInput);
  }

  // import { Public } from '@/common';
  // 这里加了@Public()装饰器，表示这个接口不需要认证，直接可以访问
  // @Public()
  @Query('articles')
  findAll() {
    return this.articleService.findAll();
  }

  @Query('article')
  findOne(
    @Args('id') id: number,
    @Args('status', ParseIntPipe) status: number,
  ) {
    return this.articleService.findOne(id, status);
  }

  @ResolveField('value')
  async getValue(@Parent() article: any) {
    // 可以从外层解析字段article中获取参数
    // const { exampleField } = article;
    return { exampleField: 11, result: 'ok' };
  }

  @Mutation('updateArticle')
  update(@Args('updateArticleInput') updateArticleInput: UpdateArticleInput) {
    return this.articleService.update(
      updateArticleInput.id,
      updateArticleInput,
    );
  }

  @Mutation('removeArticle')
  remove(@Args('id') id: number) {
    return this.articleService.remove(id);
  }
}
