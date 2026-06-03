import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDemandReportDto {
  @ApiProperty({
    example: 'Conteúdo impróprio / spam',
    description: 'Motivo da denúncia',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  reason: string;
}

