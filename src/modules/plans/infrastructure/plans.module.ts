import { Module } from '@nestjs/common'
import { IPlansRepository } from '../domain/plans.repository.interface'
import { GetCabinetPlanUseCase } from '../application/get-cabinet-plan.use-case'
import { CheckMemberLimitUseCase } from '../application/check-member-limit.use-case'
import { CheckDemandLimitUseCase } from '../application/check-demand-limit.use-case'
import { CheckStorageLimitUseCase } from '../application/check-storage-limit.use-case'
import { CheckActiveSubscriptionUseCase } from '../application/check-active-subscription.use-case'
import { PlansRepository } from './plans.repository'
import { PlansAdminController } from './plans-admin.controller'

@Module({
  controllers: [PlansAdminController],
  providers: [
    { provide: IPlansRepository, useClass: PlansRepository },
    GetCabinetPlanUseCase,
    CheckMemberLimitUseCase,
    CheckDemandLimitUseCase,
    CheckStorageLimitUseCase,
    CheckActiveSubscriptionUseCase,
  ],
  exports: [
    IPlansRepository,
    GetCabinetPlanUseCase,
    CheckMemberLimitUseCase,
    CheckDemandLimitUseCase,
    CheckStorageLimitUseCase,
    CheckActiveSubscriptionUseCase,
  ],
})
export class PlansModule {}
