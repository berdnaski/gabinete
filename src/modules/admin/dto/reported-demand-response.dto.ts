import { ApiProperty } from '@nestjs/swagger';
import { DemandEntity } from '../../demands/domain/demand.entity';

export class ReportedDemandResponseDto {
  @ApiProperty({ type: DemandEntity })
  demand: DemandEntity;

  @ApiProperty({ example: 3 })
  reportsCount: number;
}

