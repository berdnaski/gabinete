import { ApiProperty } from '@nestjs/swagger';

export class GetCabinetDashboardSummaryResponseDto {
  @ApiProperty({
    example: 120,
    description:
      'Total demands created in the selected month/year for the cabinet.',
  })
  totalDemands: number;

  @ApiProperty({
    example: 0.42,
    minimum: 0,
    maximum: 1,
    description:
      'Resolution rate for the selected month/year, computed as resolvedDemandsCount / totalDemands.',
  })
  resolvedDemands: number;

  @ApiProperty({
    example: 'Centro',
    nullable: true,
    description:
      'Neighborhood (bairro) with the most demands in the selected month/year. Null when no demands have neighborhood.',
  })
  neighborhoodWithMostDemands: string | null;
}
