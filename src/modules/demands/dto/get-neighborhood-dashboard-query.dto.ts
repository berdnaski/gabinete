import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class GetNeighborhoodDashboardQueryDto {
  @ApiProperty({ example: 'Centro' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ example: 'Belo Horizonte' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'MG' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  state: string;
}
