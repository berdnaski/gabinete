import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsOptional,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class CreateCabinetWithOwnerDto {
  @ApiProperty({ description: 'Use an existing MEMBER user as the owner' })
  @IsUUID()
  ownerUserId: string;

  @ApiProperty({ example: "Councilman Silva's Cabinet" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'contato@gabinete.gov.br' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  avatarUrl?: string;
}
