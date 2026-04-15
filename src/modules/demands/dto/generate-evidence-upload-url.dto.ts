import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateEvidenceUploadUrlDto {
  @ApiProperty({ example: 'photo.jpg', description: 'The filename of the evidence to upload' })
  @IsString()
  filename: string;
}
