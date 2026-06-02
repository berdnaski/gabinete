import { ApiProperty } from '@nestjs/swagger';

export class ReporterStatusBreakdownDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;
}

export class ReporterMonthlyActivityDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  month: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  count: number;
}

export class ReporterCategoryBreakdownDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  resolvedCount: number;
}

export class ReporterSummaryResponseDto {
  @ApiProperty()
  totalDemands: number;

  @ApiProperty({ type: [ReporterStatusBreakdownDto] })
  statusBreakdown: ReporterStatusBreakdownDto[];

  @ApiProperty()
  resolutionRate: number;

  @ApiProperty({ nullable: true })
  avgDaysToResolve: number | null;

  @ApiProperty({ type: [ReporterMonthlyActivityDto] })
  monthlyActivity: ReporterMonthlyActivityDto[];

  @ApiProperty({ type: [ReporterCategoryBreakdownDto] })
  categoryBreakdown: ReporterCategoryBreakdownDto[];
}
