import { ApiPropertyOptional } from '@nestjs/swagger';
import { DemandPriority, DemandStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListDemandsDto {
  @ApiPropertyOptional({ example: 'cl...id' })
  @IsString()
  @IsOptional()
  cabinetId: string;

  @ApiPropertyOptional({ enum: DemandStatus })
  @IsEnum(DemandStatus)
  @IsOptional()
  status?: DemandStatus;

  @ApiPropertyOptional({ enum: DemandPriority })
  @IsEnum(DemandPriority)
  @IsOptional()
  priority?: DemandPriority;

  @ApiPropertyOptional({ example: 'cl...id' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Buraco na rua' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ minimum: 1, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
