import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResultType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateResultDto {
  @ApiPropertyOptional({ example: 'Recapeamento concluído na Rua Principal' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Executamos o recapeamento asfáltico...' })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ResultType })
  @IsEnum(ResultType)
  @IsOptional()
  type?: ResultType;

  @ApiPropertyOptional({ example: 'uuid-demand-id', nullable: true })
  @IsUUID()
  @IsOptional()
  demandId?: string | null;
}
