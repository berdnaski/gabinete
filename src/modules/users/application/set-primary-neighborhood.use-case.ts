import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserNeighborhoodEntity } from '../domain/user-neighborhood.entity';
import { IUserNeighborhoodsRepository } from '../domain/user-neighborhoods.repository.interface';

@Injectable()
export class SetPrimaryNeighborhoodUseCase {
  constructor(private readonly repository: IUserNeighborhoodsRepository) {}

  async execute(id: string, userId: string): Promise<UserNeighborhoodEntity[]> {
    const neighborhood = await this.repository.findById(id);

    if (!neighborhood) {
      throw new NotFoundException('Neighborhood not found');
    }

    if (neighborhood.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.repository.clearPrimary(userId);
    await this.repository.setPrimary(id);

    return this.repository.findByUserId(userId);
  }
}
