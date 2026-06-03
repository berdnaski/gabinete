import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserNeighborhoodsRepository } from '../domain/user-neighborhoods.repository.interface';

@Injectable()
export class RemoveUserNeighborhoodUseCase {
  constructor(private readonly repository: IUserNeighborhoodsRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const neighborhood = await this.repository.findById(id);

    if (!neighborhood) {
      throw new NotFoundException('Neighborhood not found');
    }

    if (neighborhood.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.repository.delete(id);

    if (neighborhood.isPrimary) {
      const remaining = await this.repository.findByUserId(userId);
      if (remaining.length > 0) {
        await this.repository.setPrimary(remaining[0].id);
      }
    }
  }
}
