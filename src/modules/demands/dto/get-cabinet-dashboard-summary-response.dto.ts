import { ApiProperty } from '@nestjs/swagger';

export class GetCabinetDashboardSummaryResponseDto {
  @ApiProperty({
    example: 120,
    description:
      'Total demands created in the selected month/year for the cabinet.',
  })
  total: number;

  @ApiProperty({
    example: 0.42,
    minimum: 0,
    maximum: 1,
    description:
      'Resolution rate for the selected month/year, computed as resolvedCount / total.',
  })
  resolved: number;

  @ApiProperty({
    description:
      'Top neighborhoods (bairros) by demand count in the selected period (descending).',
    example: [
      { name: 'Centro', total: 30 },
      { name: 'Vila Nova', total: 21 },
    ],
  })
  mainNeighborhoods: Array<{ name: string; total: number }>;

  @ApiProperty({
    description:
      'Top categories by demand count in the selected period (descending).',
    example: [
      { id: 'cat-1', name: 'Infrastructure', total: 42 },
      { id: 'cat-2', name: 'Social', total: 12 },
    ],
  })
  categories: Array<{ id: string; name: string; total: number }>;
}
