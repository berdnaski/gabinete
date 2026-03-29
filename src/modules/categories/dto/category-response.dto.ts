import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'clxcat001' })
  id: string;

  @ApiProperty({ example: 'Infraestrutura' })
  name: string;

  @ApiProperty({ example: 'infraestrutura' })
  slug: string;
}
