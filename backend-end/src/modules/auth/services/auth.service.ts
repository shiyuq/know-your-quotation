import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.userId,
      username: user.username,
      roles: user.roles,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: `Bearer ${token}`,
    };
  }

  async getUserList() {
    // const users = await this.usersService.create('shiyuq', '18752739756');
    const users = await this.usersService.getUsers();
    return users;
  }
}
