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
}
