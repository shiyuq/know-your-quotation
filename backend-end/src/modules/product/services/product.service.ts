import { randomUUID } from 'node:crypto';
import { BusinessErrorHelper } from '@/common';
import { GlobalRole } from '@/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { UserEntity, TenantEntity } from '@/database/entities';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UtilService } from '@/modules/global/util/services/util.service';

@Injectable()
export class ProductService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,

    private jwtService: JwtService,

    private readonly utilService: UtilService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ accessToken: string; role: string }> {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      return BusinessErrorHelper.User.userNotExist();
    }
    if (!this.utilService.checkIsValidPwd(pass, user.salt, user.password)) {
      return BusinessErrorHelper.User.userPwdError();
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
      role: user.role,
    };
  }

  async registerTenant(createAuthDto: CreateAuthDto): Promise<boolean> {
    const { name, username, initPwd } = createAuthDto;
    const tenant = this.tenantRepository.create({ name });
    const result = await this.dataSource.transaction(async (manager) => {
      const tenantRes = await manager.save(tenant);
      const { salt, hashedPwd } = this.utilService.generatePwd(initPwd);
      const user = this.userRepository.create({
        username,
        tenantId: tenantRes.id,
        password: hashedPwd,
        salt,
        role: GlobalRole.BOSS,
      });
      await manager.save(user);
      return true;
    });
    return result;
  }
}
