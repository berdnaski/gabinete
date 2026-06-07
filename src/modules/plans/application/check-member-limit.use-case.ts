import { Injectable, ForbiddenException } from '@nestjs/common';
import { IPlansRepository } from '../domain/plans.repository.interface';

@Injectable()
export class CheckMemberLimitUseCase {
  constructor(private readonly plansRepository: IPlansRepository) {}

  async execute(cabinetId: string, currentCount: number): Promise<void> {
    const subscription = await this.plansRepository.getActiveSubscription(cabinetId);
    if (subscription?.plan.maxMembers !== null && subscription?.plan.maxMembers !== undefined) {
      if (currentCount >= subscription.plan.maxMembers) {
        throw new ForbiddenException(
          `Limite de membros atingido para o plano atual (máximo ${subscription.plan.maxMembers})`,
        );
      }
    }
  }
}
