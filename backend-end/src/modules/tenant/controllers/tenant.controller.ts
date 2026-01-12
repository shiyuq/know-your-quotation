import { Body, Controller, Post } from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import { Permisson } from '@/common';
import { PermissonEnum } from '@/constants';
import { ListTenantDto } from '../dto/list-tenant.dto';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { DetailTenantDto } from '../dto/detail-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('register')
  @Permisson(PermissonEnum.registerTenant)
  register(@Body() registerTenant: CreateTenantDto) {
    return this.tenantService.registerTenant(registerTenant);
  }

  @Post('list')
  @Permisson(PermissonEnum.listTenant)
  list(@Body() listTenant: ListTenantDto) {
    return this.tenantService.listTenant(listTenant);
  }

  @Post('detail')
  @Permisson(PermissonEnum.detailTenant)
  detail(@Body() detailTenant: DetailTenantDto) {
    return this.tenantService.detailTenant(detailTenant);
  }

  @Post('delete')
  @Permisson(PermissonEnum.deleteTenant)
  delete(@Body() detailTenant: DetailTenantDto) {
    return this.tenantService.deleteTenant(detailTenant);
  }

  @Post('enable')
  @Permisson(PermissonEnum.enableTenant)
  enable(@Body() detailTenant: DetailTenantDto) {
    return this.tenantService.enableTenant(detailTenant);
  }

  @Post('update')
  @Permisson(PermissonEnum.updateTenant)
  update(@Body() updateTenant: UpdateTenantDto) {
    return this.tenantService.updateTenant(updateTenant);
  }
}
