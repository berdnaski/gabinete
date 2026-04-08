import { ApiProperty } from '@nestjs/swagger';

export class GetCabinetDemandMetricsResponseDto {
  @ApiProperty({
    example: 12,
    description:
      'New demands created in the last 24 hours (rolling window, server clock)',
  })
  new: number;

  @ApiProperty({
    example: 3,
    description:
      'Urgent demands total where priority=URGENT and status is not RESOLVED, REJECTED, or CANCELED',
  })
  urgent: number;

  @ApiProperty({
    example: 120,
    description:
      'Total demands created in the current calendar month (server timezone)',
  })
  total: number;

  @ApiProperty({
    example: 50,
    description:
      'Resolved demands created in the current calendar month (status=RESOLVED, server timezone)',
  })
  resolved: number;
}
