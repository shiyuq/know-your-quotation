import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { TenantController } from './controllers/tenant.controller';
import { TenantService } from './services/tenant.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
