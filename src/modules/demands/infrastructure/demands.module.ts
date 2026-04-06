import { Module } from '@nestjs/common';
import { CreateDemandUseCase } from '../application/create-demand.use-case';
import { AddDemandEvidenceUseCase } from '../application/add-demand-evidence.use-case';
import { ListDemandsUseCase } from '../application/list-demands.use-case';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { DemandsController } from './demands.controller';
import { DemandsRepository } from './demands.repository';

import { AuthModule } from '../../auth/infrastructure/auth.module';
import { FindDemandUseCase } from '../application/find-demand-use-case';

@Module({
  imports: [AuthModule],
  controllers: [DemandsController],
  providers: [
    {
      provide: IDemandsRepository,
      useClass: DemandsRepository,
    },
    CreateDemandUseCase,
    AddDemandEvidenceUseCase,
    ListDemandsUseCase,
    FindDemandUseCase
  ],
})
export class DemandsModule { }
