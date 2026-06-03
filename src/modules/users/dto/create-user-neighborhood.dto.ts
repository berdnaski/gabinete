import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserNeighborhoodDto {
  @ApiProperty({ example: 'Centro' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ example: 'Belo Horizonte' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'MG', description: 'Two-letter state code' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  state: string;

  @ApiPropertyOptional({ example: 'Casa' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  label?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
