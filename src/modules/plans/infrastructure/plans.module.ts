import { Module } from '@nestjs/common'
import { IPlansRepository } from '../domain/plans.repository.interface'
import { GetCabinetPlanUseCase } from '../application/get-cabinet-plan.use-case'
import { PlansRepository } from './plans.repository'
import { PlansAdminController } from './plans-admin.controller'

@Module({
  controllers: [PlansAdminController],
  providers: [
    { provide: IPlansRepository, useClass: PlansRepository },
    GetCabinetPlanUseCase,
  ],
  exports: [IPlansRepository, GetCabinetPlanUseCase],
})
export class PlansModule {}
