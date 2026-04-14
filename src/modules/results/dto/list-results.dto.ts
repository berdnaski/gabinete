import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResultType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class ListResultsDto {
  @ApiPropertyOptional({ example: 'uuid-cabinet-id' })
  @IsUUID()
  @IsOptional()
  cabinetId?: string;

  @ApiPropertyOptional({ example: 'uuid-demand-id' })
  @IsUUID()
  @IsOptional()
  demandId?: string;

  @ApiPropertyOptional({ enum: ResultType })
  @IsEnum(ResultType)
  @IsOptional()
  type?: ResultType;

  @ApiPropertyOptional({ example: 'recapeamento', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsOptional()
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
