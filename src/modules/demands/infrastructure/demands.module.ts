import { Module } from '@nestjs/common';
import { CreateDemandUseCase } from '../application/create-demand.use-case';
import { AddDemandEvidenceUseCase } from '../application/add-demand-evidence.use-case';
import { ListDemandsUseCase } from '../application/list-demands.use-case';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { DemandsController } from './demands.controller';
import { DemandsRepository } from './demands.repository';

import { AuthModule } from '../../auth/infrastructure/auth.module';
import { FindDemandUseCase } from '../application/find-demand.use-case';
import { UpdateDemandUseCase } from '../application/update-demand.use-case';
import { DeleteDemandUseCase } from '../application/delete-demand.use-case';
import { ClaimDemandUseCase } from '../application/claim-demand.use-case';
import { AssignDemandUseCase } from '../application/assign-demand.use-case';
import { CreateDemandCommentUseCase } from '../application/create-demand-comment.use-case';
import { ListDemandCommentsUseCase } from '../application/list-demand-comments.use-case';
import { ToggleDemandLikeUseCase } from '../application/toggle-demand-like.use-case';
import { CabinetsModule } from '../../cabinets/infrastructure/cabinets.module';
import { DemandAccessGuard } from '../../../shared/guards/demand-access.guard';

@Module({
  imports: [AuthModule, CabinetsModule],
  controllers: [DemandsController],
  providers: [
    {
      provide: IDemandsRepository,
      useClass: DemandsRepository,
    },
    CreateDemandUseCase,
    AddDemandEvidenceUseCase,
    ListDemandsUseCase,
    FindDemandUseCase,
    UpdateDemandUseCase,
    DeleteDemandUseCase,
    ClaimDemandUseCase,
    AssignDemandUseCase,
    CreateDemandCommentUseCase,
    ListDemandCommentsUseCase,
    ToggleDemandLikeUseCase,
    DemandAccessGuard,
  ],
})
export class DemandsModule {}
