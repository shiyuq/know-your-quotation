import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public, Permisson } from '@/common';
import { PermissonEnum } from '@/constants';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { AuthLoginDto } from '../dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @Permisson(PermissonEnum.authSignIn)
  signIn(@Body() signInDto: AuthLoginDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('registerTenant')
  @Permisson(PermissonEnum.authRegisterTenant)
  register(@Body() registerTenant: CreateAuthDto) {
    return this.authService.registerTenant(registerTenant);
  }
}
