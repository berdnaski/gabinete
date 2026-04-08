import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDemandCommentDto {
  @ApiProperty({
    example:
      'The team has already been dispatched to inspect the site. - Cuzin do batcalvo',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(2000)
  content: string;
}
