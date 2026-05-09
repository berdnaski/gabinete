import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateCabinetDto } from './create-cabinet.dto';

class UpdateCabinetBaseDto extends PartialType(
  OmitType(CreateCabinetDto, ['avatarUrl'] as const),
) {}

export class UpdateCabinetDto extends UpdateCabinetBaseDto {
  @ApiPropertyOptional({ example: '#0058F3', description: 'Brand accent color (hex). Send empty string to clear.' })
  @IsOptional()
  @IsString()
  @Matches(/^(#[0-9A-Fa-f]{3,6})?$/, { message: 'accentColor must be a valid hex color or empty string' })
  accentColor?: string;

  @ApiPropertyOptional({ example: 'Mandato do povo, para o povo', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  tagline?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  postDemandMessage?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'instagramUrl must be a valid URL' })
  @MaxLength(500)
  instagramUrl?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'facebookUrl must be a valid URL' })
  @MaxLength(500)
  facebookUrl?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'websiteUrl must be a valid URL' })
  @MaxLength(500)
  websiteUrl?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'twitterUrl must be a valid URL' })
  @MaxLength(500)
  twitterUrl?: string;
}
