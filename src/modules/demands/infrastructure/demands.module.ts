import { Module } from '@nestjs/common';
import { CreateDemandUseCase } from '../application/create-demand.use-case';
import { AddDemandEvidenceUseCase } from '../application/add-demand-evidence.use-case';
import { GenerateDemandEvidenceUploadUrlUseCase } from '../application/generate-demand-evidence-upload-url.use-case';
import { ConfirmDemandEvidenceUseCase } from '../application/confirm-demand-evidence.use-case';
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
import { UsersModule } from '../../users/infrastructure/users.module';
import { DemandAccessGuard } from '../../../shared/guards/demand-access.guard';
import { GetCabinetDemandMetricsUseCase } from '../application/get-cabinet-demand-metrics.use-case';
import { GetCabinetDemandHeatmapUseCase } from '../application/get-cabinet-demand-heatmap.use-case';
import { ListDemandNeighborhoodsUseCase } from '../application/list-demand-neighborhoods.use-case';
import { ListDemandsByReporterUseCase } from '../application/list-demands-by-reporter.use-case';
import { GetCabinetDashboardSummaryUseCase } from '../application/get-cabinet-dashboard-summary.use-case';
import { GetCabinetDemandTrendUseCase } from '../application/get-cabinet-demand-trend.use-case';
import { GetCabinetDemandTrendDetailedUseCase } from '../application/get-cabinet-demand-trend-detailed.use-case';
import { ListCabinetDemandsUseCase } from '../application/list-cabinet-demands.use-case';
import { UnlinkDemandUseCase } from '../application/unlink-demand.use-case';
import { UpdateDemandProgressUseCase } from '../application/update-demand-progress.use-case';
import { GenerateCabinetReportUseCase } from '../application/generate-cabinet-report.use-case';
import { ResultsModule } from '../../results/infrastructure/results.module';
import { DemandEmailListener } from '../application/demand-email.listener';
import { GetDemandSurveyUseCase } from '../application/get-demand-survey.use-case';
import { SubmitDemandSurveyUseCase } from '../application/submit-demand-survey.use-case';
import { CreateDemandReportUseCase } from '../application/create-demand-report.use-case';
import { ListReportedDemandsUseCase } from '../application/list-reported-demands.use-case';
import { ListDemandReportReasonsUseCase } from '../application/list-demand-report-reasons.use-case';
import { DismissDemandReportsUseCase } from '../application/dismiss-demand-reports.use-case';
import { GetReporterSummaryUseCase } from '../application/get-reporter-summary.use-case';
import { GetCabinetOpenDataUseCase } from '../application/get-cabinet-open-data.use-case';
import { GetNeighborhoodDashboardUseCase } from '../application/get-neighborhood-dashboard.use-case';

@Module({
  imports: [AuthModule, CabinetsModule, UsersModule, ResultsModule],
  controllers: [DemandsController],
  providers: [
    {
      provide: IDemandsRepository,
      useClass: DemandsRepository,
    },
    CreateDemandUseCase,
    AddDemandEvidenceUseCase,
    GenerateDemandEvidenceUploadUrlUseCase,
    ConfirmDemandEvidenceUseCase,
    ListDemandsUseCase,
    FindDemandUseCase,
    UpdateDemandUseCase,
    DeleteDemandUseCase,
    ClaimDemandUseCase,
    AssignDemandUseCase,
    CreateDemandCommentUseCase,
    ListDemandCommentsUseCase,
    ToggleDemandLikeUseCase,
    GetCabinetDemandMetricsUseCase,
    GetCabinetDashboardSummaryUseCase,
    GetCabinetDemandHeatmapUseCase,
    ListDemandNeighborhoodsUseCase,
    ListDemandsByReporterUseCase,
    ListCabinetDemandsUseCase,
    UnlinkDemandUseCase,
    UpdateDemandProgressUseCase,
    GetCabinetDemandTrendUseCase,
    GetCabinetDemandTrendDetailedUseCase,
    GenerateCabinetReportUseCase,
    DemandEmailListener,
    GetDemandSurveyUseCase,
    SubmitDemandSurveyUseCase,
    CreateDemandReportUseCase,
    ListReportedDemandsUseCase,
    ListDemandReportReasonsUseCase,
    DismissDemandReportsUseCase,
    GetReporterSummaryUseCase,
    GetCabinetOpenDataUseCase,
    GetNeighborhoodDashboardUseCase,
    DemandAccessGuard,
  ],
  exports: [ListReportedDemandsUseCase, ListDemandReportReasonsUseCase, DismissDemandReportsUseCase, DeleteDemandUseCase, FindDemandUseCase, IDemandsRepository],
})
export class DemandsModule {}
