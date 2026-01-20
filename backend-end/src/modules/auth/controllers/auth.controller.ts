import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public, Permisson } from '@/common';
import { PermissonEnum } from '@/constants';
import { AuthLoginDto } from '../dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Permisson(PermissonEnum.authSignIn)
  signIn(@Body() signInDto: AuthLoginDto) {
    return this.authService.signIn(signInDto);
  }
}
