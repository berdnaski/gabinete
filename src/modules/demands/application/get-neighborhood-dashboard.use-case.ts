import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IDemandsRepository,
  NeighborhoodDashboardData,
} from '../domain/demands.repository.interface';

export interface GetNeighborhoodDashboardInput {
  neighborhood: string;
  city: string;
  state: string;
}

@Injectable()
export class GetNeighborhoodDashboardUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(input: GetNeighborhoodDashboardInput): Promise<NeighborhoodDashboardData> {
    if (!input.neighborhood?.trim() || !input.city?.trim() || !input.state?.trim()) {
      throw new BadRequestException('neighborhood, city and state are required');
    }

    return this.demandsRepository.getNeighborhoodDashboard(
      input.neighborhood.trim(),
      input.city.trim(),
      input.state.trim(),
    );
  }
}
