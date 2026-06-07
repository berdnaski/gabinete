import { Injectable, ForbiddenException } from '@nestjs/common';
import { IPlansRepository } from '../domain/plans.repository.interface';

@Injectable()
export class CheckStorageLimitUseCase {
  constructor(private readonly plansRepository: IPlansRepository) {}

  async execute(cabinetId: string, additionalBytes: number): Promise<void> {
    const subscription = await this.plansRepository.getActiveSubscription(cabinetId);
    if (subscription?.plan.maxStorageGb == null) return;
    const { storageUsedBytes } = await this.plansRepository.getCabinetUsage(cabinetId);
    const maxBytes = subscription.plan.maxStorageGb * 1024 ** 3;
    if (storageUsedBytes + additionalBytes > maxBytes) {
      throw new ForbiddenException(
        `Limite de armazenamento atingido para o plano atual (máximo ${subscription.plan.maxStorageGb} GB)`,
      );
    }
  }
}
