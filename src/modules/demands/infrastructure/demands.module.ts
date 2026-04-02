import { Module } from '@nestjs/common';
import { CreateDemandUseCase } from '../application/create-demand.use-case';
import { AddDemandEvidenceUseCase } from '../application/add-demand-evidence.use-case';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { DemandsController } from './demands.controller';
import { DemandsRepository } from './demands.repository';

import { AuthModule } from '../../auth/infrastructure/auth.module';

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
  ],
})
export class DemandsModule {}
