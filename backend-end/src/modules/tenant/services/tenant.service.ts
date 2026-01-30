import { BusinessErrorHelper } from '@/common';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
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

    await this.transactionService.required(async () => {});

    const result = await this.dataSource.transaction(async (manager) => {
      const tenant = this.tenantRepository.create({
        name: companyName,
        valid: true,
      });
      const tenantRes = await manager.save(tenant);

      const { salt, hashedPwd } = this.utilService.generatePwd(initPwd);

      const user = this.userRepository.create({
        username: email,
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

  async listTenant(listTenantDto: ListTenantDto) {
    const { pageSize, pageIndex, companyName, valid } = listTenantDto;

    // 1️⃣ 创建 QueryBuilder
    const qb = this.tenantRepository.createQueryBuilder('tenant');

    // 2️⃣ 选择需要返回的字段（Raw 查询）
    qb.select([
      'tenant.id AS id',
      'tenant.name AS name',
      'tenant.tel AS tel',
      'tenant.valid AS valid',
      'tenant.createTime AS createTime',
      'tenant.updateTime AS updateTime',
    ]).orderBy('tenant.createTime', 'DESC');

    // 3️⃣ 动态条件
    if (companyName) {
      qb.andWhere('tenant.name LIKE :companyName', {
        companyName: `%${companyName}%`,
      });
    }

    if (valid !== undefined) {
      qb.andWhere('tenant.valid = :valid', { valid }); // true 或 false
    }

    // 4️⃣ 分页（Raw 查询 + take/skip）
    const [list, total] = await Promise.all([
      qb
        .clone()
        .take(pageSize)
        .skip((pageIndex - 1) * pageSize)
        .getRawMany(),
      qb.clone().getCount(),
    ]);

    // 6️⃣ 返回 DTO
    return { list, total, currentPage: pageIndex, pageSize };
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
