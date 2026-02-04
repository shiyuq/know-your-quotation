import { BusinessErrorHelper } from '@/common';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { DetailTenantDto } from '../dto/detail-tenant.dto';
import { GlobalRole } from '@/constants';
import { Injectable } from '@nestjs/common';
import { ListTenantDto } from '../dto/list-tenant.dto';
import { TenantRepository } from '@/database/repository/tenant.repository';
import { TransactionService } from '@/modules/global/util/services/transaction.service';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { UserRepository } from '@/database/repository/user.repository';
import { UtilService } from '@/modules/global/util/services/util.service';
import _ from 'lodash';

@Injectable()
export class TenantService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly utilService: UtilService,
    private readonly transactionService: TransactionService,
  ) {}

  async registerTenant(createTenantDto: CreateTenantDto): Promise<boolean> {
    const { companyName, email, initPwd } = createTenantDto;
    const tenantExist = await this.tenantRepository.findOneBy({
      name: companyName,
    });
    if (tenantExist) {
      return BusinessErrorHelper.User.tenantExist();
    }

    // 开启事务，所有方法自动加入事务
    const result = await this.transactionService.required(async () => {
      const tenant = this.tenantRepository.create({
        name: companyName,
        valid: true,
      });
      const tenantRes = await this.tenantRepository.save(tenant);

      const { salt, hashedPwd } = this.utilService.generatePwd(initPwd);

      const user = this.userRepository.create({
        username: email,
        tenantId: tenantRes.id,
        password: hashedPwd,
        salt,
        role: GlobalRole.BOSS,
      });
      await this.userRepository.save(user);
      return true;
    });
    return result;
  }

  async listTenant(listTenantDto: ListTenantDto) {
    const { pageIndex, pageSize } = listTenantDto;
    const [list, total] =
      await this.tenantRepository.getTenantListByPagination(listTenantDto);
    return {
      list: _.map(list, (i) => ({
        ..._.pick(i, ['id', 'name', 'tel', 'createTime', 'updateTime']),
        valid: i.valid ? 1 : 0,
      })),
      total,
      currentPage: pageIndex,
      pageSize,
    };
  }

  async detailTenant(detailTenantDto: DetailTenantDto) {
    const { id } = detailTenantDto;
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      return BusinessErrorHelper.User.tenantNotExist();
    }
    return tenant;
  }

  async deleteTenant(detailTenantDto: DetailTenantDto) {
    const { id } = detailTenantDto;
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      return BusinessErrorHelper.User.tenantNotExist();
    }
    tenant.valid = false;
    await this.tenantRepository.save(tenant);
    return true;
  }

  async enableTenant(detailTenantDto: DetailTenantDto) {
    const { id } = detailTenantDto;
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      return BusinessErrorHelper.User.tenantNotExist();
    }
    tenant.valid = true;
    await this.tenantRepository.save(tenant);
    return true;
  }

  async updateTenant(updateTenantDto: UpdateTenantDto) {
    const { id, ...rest } = _.pickBy(updateTenantDto, (v) => v !== undefined);
    if (_.isEmpty(rest)) {
      return true;
    }
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      return BusinessErrorHelper.User.tenantNotExist();
    }
    const updateData: Record<string, any> = rest;
    if (updateData.companyName) {
      updateData.name = rest.companyName;
      delete updateData.companyName;
    }
    await this.tenantRepository.update(id!, updateData);
    return true;
  }
}
