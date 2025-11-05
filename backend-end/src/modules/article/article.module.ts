import { ArticleResolver } from './resolvers/article.resolver';
import { ArticleService } from './services/article.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [ArticleResolver, ArticleService],
})
export class ArticleModule {}
