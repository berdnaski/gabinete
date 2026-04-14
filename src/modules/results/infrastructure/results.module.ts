import { Module } from '@nestjs/common';
import { CabinetsModule } from '../../cabinets/infrastructure/cabinets.module';
import { IResultsRepository } from '../domain/results.repository.interface';
import { AddResultImagesUseCase } from '../application/add-result-images.use-case';
import { CreateResultUseCase } from '../application/create-result.use-case';
import { DeleteResultUseCase } from '../application/delete-result.use-case';
import { FindResultUseCase } from '../application/find-result.use-case';
import { ListResultsUseCase } from '../application/list-results.use-case';
import { UpdateResultUseCase } from '../application/update-result.use-case';
import { UploadResultProtocolUseCase } from '../application/upload-result-protocol.use-case';
import { ResultsController } from './results.controller';
import { ResultsRepository } from './results.repository';
import { ResultAccessGuard } from '../../../shared/guards/result-access.guard';

@Module({
  imports: [CabinetsModule],
  controllers: [ResultsController],
  providers: [
    { provide: IResultsRepository, useClass: ResultsRepository },
    ResultAccessGuard,
    CreateResultUseCase,
    ListResultsUseCase,
    FindResultUseCase,
    UpdateResultUseCase,
    DeleteResultUseCase,
    AddResultImagesUseCase,
    UploadResultProtocolUseCase,
  ],
  exports: [IResultsRepository],
})
export class ResultsModule {}
