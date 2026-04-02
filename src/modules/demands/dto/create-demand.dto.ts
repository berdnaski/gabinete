import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { DemandPriority } from '@prisma/client';

export class CreateDemandDto {
  @ApiProperty({ example: 'Buraco na rua principal' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'O asfalto cedeu e formou uma cratera...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: DemandPriority, default: DemandPriority.MEDIUM })
  @IsEnum(DemandPriority)
  @IsOptional()
  priority?: DemandPriority;

  @ApiProperty({ example: 'Rua Principal, 123' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '12345-678' })
  @IsString()
  @IsNotEmpty()
  zipcode: string;

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

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'joao@example.com', required: false })
  @IsEmail()
  @IsOptional()
  @ValidateIf(
    (o) => typeof o.reporterId === 'undefined' || o.reporterId === null,
  )
  guestEmail?: string;

  @ApiProperty({ example: 'cmng...', required: false })
  @IsString()
  @IsOptional()
  cabinetId?: string;

  @ApiProperty({ example: 'cmng...', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
