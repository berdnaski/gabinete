import { Injectable, ForbiddenException } from '@nestjs/common';
import { IPlansRepository } from '../domain/plans.repository.interface';

@Injectable()
export class CheckStorageLimitUseCase {
  constructor(private readonly plansRepository: IPlansRepository) {}

  async execute(cabinetId: string, additionalBytes: number): Promise<void> {
    const subscription = await this.plansRepository.getActiveSubscription(cabinetId);
    if (subscription?.plan.maxStorageBytes == null) return;
    const { storageUsedBytes } = await this.plansRepository.getCabinetUsage(cabinetId);
    const maxBytes = subscription.plan.maxStorageBytes;
    console.log({
      maxBytes
    })
    if (storageUsedBytes + additionalBytes > maxBytes) {
      const maxMb = Math.round(maxBytes / 1024 / 1024);
      throw new ForbiddenException(
        `Limite de armazenamento atingido para o plano atual (máximo ${maxMb} MB)`,
      );
    }
  }
}
