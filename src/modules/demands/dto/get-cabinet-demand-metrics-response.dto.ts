import { ApiProperty } from '@nestjs/swagger';

export class CabinetStatusCountsDto {
  @ApiProperty({ example: 5 }) SUBMITTED: number;
  @ApiProperty({ example: 3 }) IN_ANALYSIS: number;
  @ApiProperty({ example: 4 }) IN_PROGRESS: number;
  @ApiProperty({ example: 10 }) RESOLVED: number;
  @ApiProperty({ example: 1 }) REJECTED: number;
  @ApiProperty({ example: 0 }) CANCELED: number;
}

export class GetCabinetDemandMetricsResponseDto {
  @ApiProperty({ example: 12, description: 'New demands in the last 24 hours' })
  new: number;

  @ApiProperty({ example: 3, description: 'Urgent open demands' })
  urgent: number;

  @ApiProperty({ example: 120, description: 'Total demands this month' })
  total: number;

  @ApiProperty({ example: 50, description: 'Resolved demands this month' })
  resolved: number;

  @ApiProperty({ type: CabinetStatusCountsDto, description: 'All-time demand counts by status' })
  statusCounts: CabinetStatusCountsDto;
}
