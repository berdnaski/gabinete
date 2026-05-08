import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CabinetsModule } from '../../cabinets/infrastructure/cabinets.module';
import { UsersModule } from '../../users/infrastructure/users.module';
import { CreateCabinetWithOwnerUseCase } from '../application/create-cabinet-with-owner.use-case';
import { CreateAdminUserUseCase } from '../application/create-admin-user.use-case';
import { UpdateAdminUserUseCase } from '../application/update-admin-user.use-case';

@Module({
  imports: [CabinetsModule, UsersModule],
  controllers: [AdminController],
  providers: [CreateCabinetWithOwnerUseCase, CreateAdminUserUseCase, UpdateAdminUserUseCase],
})
export class AdminModule {}
