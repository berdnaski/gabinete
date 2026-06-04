import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetDemandHeatmapQueryDto {
  @ApiPropertyOptional({ description: 'Filter heatmap points by city name (case-insensitive)' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter heatmap points by state abbreviation, e.g. SP' })
  @IsString()
  @IsOptional()
  state?: string;
}
