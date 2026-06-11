import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CabinetsModule } from '../../cabinets/infrastructure/cabinets.module';
import { UsersModule } from '../../users/infrastructure/users.module';
import { DemandsModule } from '../../demands/infrastructure/demands.module';
import { CreateCabinetWithOwnerUseCase } from '../application/create-cabinet-with-owner.use-case';
import { CreateAdminUserUseCase } from '../application/create-admin-user.use-case';
import { UpdateAdminUserUseCase } from '../application/update-admin-user.use-case';
import { DisableUserUseCase } from '../application/disable-user.use-case';
import { EnableUserUseCase } from '../application/enable-user.use-case';
import { EnableCabinetUseCase } from '../application/enable-cabinet.use-case';

@Module({
  imports: [CabinetsModule, UsersModule, DemandsModule],
  controllers: [AdminController],
  providers: [CreateCabinetWithOwnerUseCase, CreateAdminUserUseCase, UpdateAdminUserUseCase, DisableUserUseCase, EnableUserUseCase, EnableCabinetUseCase],
})
export class AdminModule {}
