import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class ConfirmEvidenceUploadDto {
  @ApiProperty({
    example: 'demands/uuid/uuid.jpg',
    description: 'The storage key returned from the presign endpoint',
  })
  @IsString()
  storageKey: string;

  @ApiProperty({
    example: 204800,
    description: 'The file size in bytes',
  })
  @IsInt()
  @Min(1)
  size: number;
}
