import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetCabinetDashboardSummaryQueryDto {
  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    maximum: 12,
    description:
      'Calendar month number (1-12). Defaults to current month when omitted.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @ApiPropertyOptional({
    example: 2026,
    minimum: 1970,
    description:
      'Calendar year (e.g., 2026). Defaults to current year when omitted.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @IsOptional()
  year?: number;
}
