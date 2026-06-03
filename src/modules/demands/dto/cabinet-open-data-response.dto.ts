import { ApiProperty } from '@nestjs/swagger';

export class OpenDataStatusStatDto {
  @ApiProperty() status: string;
  @ApiProperty() count: number;
  @ApiProperty() percentage: number;
}

export class OpenDataCategoryStatDto {
  @ApiProperty() name: string;
  @ApiProperty() count: number;
  @ApiProperty() percentage: number;
}

export class OpenDataNeighborhoodStatDto {
  @ApiProperty() neighborhood: string;
  @ApiProperty() count: number;
}

export class OpenDataMonthlyTrendDto {
  @ApiProperty() yearMonth: string;
  @ApiProperty() created: number;
  @ApiProperty() resolved: number;
}

export class OpenDataSummaryDto {
  @ApiProperty() totalDemands: number;
  @ApiProperty() resolvedDemands: number;
  @ApiProperty() resolutionRate: number;
  @ApiProperty({ nullable: true }) avgDaysToResolve: number | null;
}

export class CabinetInfoDto {
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
}

export class CabinetOpenDataResponseDto {
  @ApiProperty({ type: CabinetInfoDto }) cabinet: CabinetInfoDto;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: OpenDataSummaryDto }) summary: OpenDataSummaryDto;
  @ApiProperty({ type: [OpenDataStatusStatDto] }) byStatus: OpenDataStatusStatDto[];
  @ApiProperty({ type: [OpenDataCategoryStatDto] }) byCategory: OpenDataCategoryStatDto[];
  @ApiProperty({ type: [OpenDataNeighborhoodStatDto] }) byNeighborhood: OpenDataNeighborhoodStatDto[];
  @ApiProperty({ type: [OpenDataMonthlyTrendDto] }) monthlyTrend: OpenDataMonthlyTrendDto[];
}
