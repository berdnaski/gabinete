import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class NeighborhoodStatsDto {
  @ApiProperty() active: number;
  @ApiProperty() resolved: number;
  @ApiProperty() total: number;
  @ApiProperty() resolutionRate: number;
}

class NeighborhoodCategoryDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() count: number;
  @ApiProperty() percentage: number;
}

class NeighborhoodCabinetDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiPropertyOptional({ nullable: true }) avatarUrl: string | null;
  @ApiProperty() resolvedCount: number;
  @ApiProperty() totalCount: number;
}

export class NeighborhoodDashboardResponseDto {
  @ApiProperty() neighborhood: string;
  @ApiProperty() city: string;
  @ApiProperty() state: string;
  @ApiProperty({ type: NeighborhoodStatsDto }) stats: NeighborhoodStatsDto;
  @ApiProperty({ type: [NeighborhoodCategoryDto] }) topCategories: NeighborhoodCategoryDto[];
  @ApiProperty({ type: [NeighborhoodCabinetDto] }) servingCabinets: NeighborhoodCabinetDto[];
  @ApiProperty() recentDemands: unknown[];
}
