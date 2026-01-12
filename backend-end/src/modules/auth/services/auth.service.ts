import _ from 'lodash';
import { BusinessErrorHelper } from '@/common';
import { GlobalRole } from '@/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { UserEntity, TenantEntity } from '@/database/entities';
import { UtilService } from '@/modules/global/util/services/util.service';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,

    private readonly jwtService: JwtService,

    private readonly utilService: UtilService,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      return BusinessErrorHelper.User.userNotExist();
    }
    if (!this.utilService.checkIsValidPwd(pass, user.salt, user.password)) {
      return BusinessErrorHelper.User.userPwdError();
    }
    if (!user.tenantId && user.role !== GlobalRole.PLATFORM_ADMIN) {
      return BusinessErrorHelper.User.tenantNotExist();
    }
    let tenantInfo: TenantEntity | { name: string };
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
      sub: user.id,
      tenantId: user.tenantId,
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
    };
  }
}
