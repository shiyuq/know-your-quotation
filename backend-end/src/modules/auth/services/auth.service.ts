import { AuthLoginDto } from '../dto/auth-login.dto';
import { BusinessErrorHelper } from '@/common';
import { GlobalRole } from '@/constants';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantRepository } from '@/database/repository/tenant.repository';
import { UserRepository } from '@/database/repository/user.repository';
import { UtilService } from '@/modules/global/util/services/util.service';
import _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly jwtService: JwtService,
    private readonly utilService: UtilService,
  ) {}

  async signIn(signInDto: AuthLoginDto) {
    const { username, password } = signInDto;
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      return BusinessErrorHelper.User.userNotExist();
    }
    if (!this.utilService.checkIsValidPwd(password, user.salt, user.password)) {
      return BusinessErrorHelper.User.userPwdError();
    }
    if (!user.tenantId && user.role !== GlobalRole.PLATFORM_ADMIN) {
      return BusinessErrorHelper.User.tenantNotExist();
    }
    let tenantInfo;
    if (user.tenantId) {
      const tenant = await this.tenantRepository.findOneBy({
        id: user.tenantId,
      });
      if (_.isEmpty(tenant)) {
        return BusinessErrorHelper.User.tenantNotExist();
      }
      tenantInfo = tenant!;
    } else {
      tenantInfo = { name: '平台管理员' };
    }
    const payload = {
      tenantId: user.tenantId,
      tenantName: tenantInfo.name,
      sub: user.id,
      userId: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      accessToken: `Bearer ${token}`,
      username: user.username,
      tenantId: user.tenantId,
      tenantName: tenantInfo.name,
      role: user.role,
      status: user.status,
    };
  }
}
