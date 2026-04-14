import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../../modules/users/domain/user.entity';
import { ICabinetMembersRepository } from '../../modules/cabinets/domain/cabinet-members.repository.interface';
import { IResultsRepository } from '../../modules/results/domain/results.repository.interface';
import { ResultEntity } from '../../modules/results/domain/result.entity';

@Injectable()
export class ResultAccessGuard implements CanActivate {
  constructor(
    private readonly resultsRepository: IResultsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: UserEntity;
      params: Record<string, string>;
      result?: ResultEntity;
    }>();
    const { user, params } = request;

    if (!user) {
      return false;
    }

    const resultId = params.id;
    if (!resultId) {
      return true;
    }

    const result = await this.resultsRepository.findById(resultId);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }

    const membership = await this.cabinetMembersRepository.findMembership(user.id, result.cabinetId);
    if (!membership) {
      throw new ForbiddenException('Você não tem permissão para gerenciar resultados deste gabinete');
    }

    request.result = result;
    return true;
  }
}
