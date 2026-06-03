import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserNeighborhoodResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Centro' })
  neighborhood: string;

  @ApiProperty({ example: 'Belo Horizonte' })
  city: string;

  @ApiProperty({ example: 'MG' })
  state: string;

  @ApiPropertyOptional({ nullable: true, example: 'Casa' })
  label: string | null;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  createdAt: Date;
}
