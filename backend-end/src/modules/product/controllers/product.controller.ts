import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { Public, Permisson } from '@/common';
import { PermissonEnum } from '@/constants';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Public()
  @Post('login')
  @Permisson(PermissonEnum.authSignIn)
  signIn(@Body() signInDto: AuthLoginDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
