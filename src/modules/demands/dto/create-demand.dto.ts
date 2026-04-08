import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { DemandPriority } from '@prisma/client';

export class CreateDemandDto {
  @ApiProperty({ example: 'Pothole on Main Street', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example:
      'The asphalt cracked and formed a crater near the traffic light...',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    enum: DemandPriority,
    default: DemandPriority.MEDIUM,
    required: false,
  })
  @IsEnum(DemandPriority)
  @IsOptional()
  priority?: DemandPriority;

  @ApiProperty({ example: 'Main Street, 123', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  address: string;

  @ApiProperty({ example: '12345-678', maxLength: 9 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(9)
  zipcode: string;

  @ApiProperty({ example: -23.55052, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: -46.633308, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  long?: number;

  @ApiProperty({ example: 'Downtown', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    example: 'SP',
    maxLength: 2,
    description: 'Two-letter state code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state: string;

  @ApiProperty({ example: 'joao@example.com', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(254)
  @ValidateIf(
    (o: Record<string, unknown>) =>
      typeof o.reporterId === 'undefined' || o.reporterId === null,
  )
  guestEmail?: string;

  @ApiProperty({ example: 'cm...id', required: false })
  @IsUUID()
  @IsOptional()
  cabinetId?: string;

  @ApiProperty({ example: 'cm...id', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
