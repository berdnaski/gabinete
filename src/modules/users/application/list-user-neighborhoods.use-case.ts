import { Injectable } from '@nestjs/common';
import { UserNeighborhoodEntity } from '../domain/user-neighborhood.entity';
import { IUserNeighborhoodsRepository } from '../domain/user-neighborhoods.repository.interface';

@Injectable()
export class ListUserNeighborhoodsUseCase {
  constructor(private readonly repository: IUserNeighborhoodsRepository) {}

  async execute(userId: string): Promise<UserNeighborhoodEntity[]> {
    return this.repository.findByUserId(userId);
  }
}
