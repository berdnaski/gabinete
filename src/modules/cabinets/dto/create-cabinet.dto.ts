import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCabinetDto {
  @ApiProperty({ example: 'Gabinete do Vereador Silva' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Gabinete focado em infraestrutura urbana' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
