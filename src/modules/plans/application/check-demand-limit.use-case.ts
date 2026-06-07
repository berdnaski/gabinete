import { Injectable, ForbiddenException } from '@nestjs/common';
import { IPlansRepository } from '../domain/plans.repository.interface';

@Injectable()
export class CheckDemandLimitUseCase {
  constructor(private readonly plansRepository: IPlansRepository) {}

  async execute(cabinetId: string, currentCount: number): Promise<void> {
    const subscription = await this.plansRepository.getActiveSubscription(cabinetId);
    if (subscription?.plan.maxDemands !== null && subscription?.plan.maxDemands !== undefined) {
      if (currentCount >= subscription.plan.maxDemands) {
        throw new ForbiddenException(
          `Limite de demandas atingido para o plano atual (máximo ${subscription.plan.maxDemands})`,
        );
      }
    }
  }
}
