import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { UserNeighborhoodEntity } from '../domain/user-neighborhood.entity';
import { IUserNeighborhoodsRepository } from '../domain/user-neighborhoods.repository.interface';

const MAX_NEIGHBORHOODS = 3;

export interface AddUserNeighborhoodInput {
  userId: string;
  neighborhood: string;
  city: string;
  state: string;
  label?: string;
  isPrimary?: boolean;
}

@Injectable()
export class AddUserNeighborhoodUseCase {
  constructor(private readonly repository: IUserNeighborhoodsRepository) {}

  async execute(input: AddUserNeighborhoodInput): Promise<UserNeighborhoodEntity> {
    const count = await this.repository.countByUserId(input.userId);

    if (count >= MAX_NEIGHBORHOODS) {
      throw new BadRequestException(`Maximum of ${MAX_NEIGHBORHOODS} neighborhoods allowed`);
    }

    const existing = await this.repository.findByLocation(
      input.userId,
      input.neighborhood,
      input.city,
      input.state,
    );
    if (existing) {
      throw new ConflictException('Neighborhood already saved');
    }

    const isFirstOrPrimary = count === 0 || input.isPrimary === true;

    if (isFirstOrPrimary) {
      await this.repository.clearPrimary(input.userId);
    }

    return this.repository.create({
      userId: input.userId,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state,
      label: input.label,
      isPrimary: isFirstOrPrimary,
    });
  }
}
