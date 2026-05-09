import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CabinetResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id: string;

  @ApiProperty({ example: 'Gabinete do Vereador Silva' })
  name: string;

  @ApiProperty({ example: 'gabinete-do-vereador-silva' })
  slug: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  bannerUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  logoUrl: string | null;

  @ApiPropertyOptional({ nullable: true, example: '#0058F3' })
  accentColor: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Mandato do povo, para o povo' })
  tagline: string | null;

  @ApiPropertyOptional({ nullable: true })
  postDemandMessage: string | null;

  @ApiPropertyOptional({ nullable: true })
  instagramUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  facebookUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  websiteUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  twitterUrl: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'contato@gabinete.gov.br' })
  email: string | null;

  @ApiProperty({ example: 0 })
  score: number;

  @ApiProperty({ example: 0 })
  demand_count: number;

  @ApiProperty({ example: 0 })
  in_progress_count: number;

  @ApiProperty({ example: 0 })
  resolved_count: number;

  @ApiProperty({ example: 72, description: 'Resolution rate 0-100' })
  transparencyScore: number;
}
