import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class DeleteDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
  ) {}

  async execute(id: string) {
    const demand = await this.demandsRepository.findById(id);

    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    await this.demandsRepository.update(id, { disabledAt: new Date() });
  }
}
