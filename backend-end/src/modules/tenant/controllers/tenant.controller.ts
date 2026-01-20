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
  @Permisson({ permission: PermissonEnum.registerTenant })
  register(@Body() registerTenant: CreateTenantDto) {
    return this.tenantService.registerTenant(registerTenant);
  }

  @Post('list')
  @Permisson({ permission: PermissonEnum.listTenant })
  list(@Body() listTenant: ListTenantDto) {
    return this.tenantService.listTenant(listTenant);
  }

  @Post('detail')
  @Permisson({ permission: PermissonEnum.detailTenant })
  detail(@Body() detailTenant: DetailTenantDto) {
    return this.tenantService.detailTenant(detailTenant);
  }

  @Post('delete')
  @Permisson({ permission: PermissonEnum.deleteTenant })
  delete(@Body() detailTenant: DetailTenantDto) {
    return this.tenantService.deleteTenant(detailTenant);
  }

  @Post('enable')
  @Permisson({ permission: PermissonEnum.enableTenant })
  enable(@Body() detailTenant: DetailTenantDto) {
    return this.tenantService.enableTenant(detailTenant);
  }

  @Post('update')
  @Permisson({ permission: PermissonEnum.updateTenant })
  update(@Body() updateTenant: UpdateTenantDto) {
    return this.tenantService.updateTenant(updateTenant);
  }
}
