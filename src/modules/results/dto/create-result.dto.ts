import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateResultDto {
  @ApiProperty({ example: 'Recapeamento concluído na Rua Principal' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Executamos o recapeamento asfáltico no trecho indicado pela demanda...' })
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: ResultType, example: ResultType.INFRASTRUCTURE })
  @IsEnum(ResultType)
  type: ResultType;

  @ApiProperty({ example: 'gabinete-vereador-silva', description: 'Slug do gabinete do usuário autenticado' })
  @IsString()
  cabinetSlug: string;

  @ApiPropertyOptional({ example: 'uuid-demand-id', nullable: true })
  @IsUUID()
  @IsOptional()
  demandId?: string | null;
}
