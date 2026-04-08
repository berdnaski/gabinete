import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DemandPriority, DemandStatus } from '@prisma/client';

export class UpdateDemandDto {
  @ApiProperty({
    example: 'Buraco na rua principal (Atualizado)',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Descrição detalhada atualizada...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DemandStatus, required: false })
  @IsEnum(DemandStatus)
  @IsOptional()
  status?: DemandStatus;

  @ApiProperty({ enum: DemandPriority, required: false })
  @IsEnum(DemandPriority)
  @IsOptional()
  priority?: DemandPriority;

  @ApiProperty({ example: 'Rua Principal, 123', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '12345-678', required: false })
  @IsString()
  @IsOptional()
  zipcode?: string;

  @ApiProperty({ example: -23.55052, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: -46.633308, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  long?: number;

  @ApiProperty({ example: 'Centro', required: false })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: 'categoryId...', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'assigneeMemberId...', required: false })
  @IsString()
  @IsOptional()
  assigneeMemberId?: string;
}
