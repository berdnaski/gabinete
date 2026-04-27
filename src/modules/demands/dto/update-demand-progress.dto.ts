import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DemandStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDemandProgressDto {
  @ApiProperty({ enum: DemandStatus })
  @IsEnum(DemandStatus)
  status: DemandStatus;

  @ApiPropertyOptional({
    example: 'Iniciamos os trabalhos de reparo no local.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
