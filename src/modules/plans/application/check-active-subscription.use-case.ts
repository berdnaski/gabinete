import { Injectable, ForbiddenException } from '@nestjs/common';
import { IPlansRepository } from '../domain/plans.repository.interface';

@Injectable()
export class CheckActiveSubscriptionUseCase {
  constructor(private readonly plansRepository: IPlansRepository) {}

  async execute(cabinetId: string): Promise<void> {
    const subscription = await this.plansRepository.getActiveSubscription(cabinetId);
    if (!subscription) {
      throw new ForbiddenException(
        'Este gabinete não possui uma assinatura ativa. Entre em contato com um Consultor para continuar.',
      );
    }
  }
}
