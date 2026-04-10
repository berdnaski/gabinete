import { ApiPropertyOptional } from '@nestjs/swagger';
import { DemandPriority, DemandStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListDemandsDto {
  @ApiPropertyOptional({ description: 'Filter by cabinet ID' })
  @IsUUID()
  @IsOptional()
  cabinetId?: string;

  @ApiPropertyOptional({
    description: 'Return only unassigned demands',
    default: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  unassignedOnly?: boolean;

  @ApiPropertyOptional({ enum: DemandStatus })
  @IsEnum(DemandStatus)
  @IsOptional()
  status?: DemandStatus;

  @ApiPropertyOptional({ enum: DemandPriority })
  @IsEnum(DemandPriority)
  @IsOptional()
  priority?: DemandPriority;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category IDs or slugs (array or comma-separated)',
  })
  @IsOptional()
  categories?: string | string[];

  @ApiPropertyOptional({
    description: 'Filter by neighborhood names (array or comma-separated)',
  })
  @IsOptional()
  neighborhoods?: string | string[];

  @ApiPropertyOptional({ example: 'Pothole on main street', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
