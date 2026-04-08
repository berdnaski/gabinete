import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { DemandPriority, DemandStatus } from '@prisma/client';

export class UpdateDemandDto {
  @ApiPropertyOptional({
    example: 'Pothole on Main Street (Updated)',
    maxLength: 150,
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated detailed description of the issue...',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: DemandStatus })
  @IsEnum(DemandStatus)
  @IsOptional()
  status?: DemandStatus;

  @ApiPropertyOptional({ enum: DemandPriority })
  @IsEnum(DemandPriority)
  @IsOptional()
  priority?: DemandPriority;

  @ApiPropertyOptional({ example: 'Main Street, 123', maxLength: 300 })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional({ example: '12345-678', maxLength: 9 })
  @IsString()
  @IsOptional()
  @MaxLength(9)
  zipcode?: string;

  @ApiPropertyOptional({ example: -23.55052 })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: -46.633308 })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  long?: number;

  @ApiPropertyOptional({ example: 'Downtown', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'São Paulo', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: 'SP',
    maxLength: 2,
    description: 'Two-letter state code',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ example: 'cm...id UUID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'cm...id UUID' })
  @IsUUID()
  @IsOptional()
  assigneeMemberId?: string;
}
