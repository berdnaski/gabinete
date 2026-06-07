import { ApiProperty } from '@nestjs/swagger';

export class ResultImageEntity {
  @ApiProperty({ example: 'uuid-image-id' })
  id: string;

  @ApiProperty({ example: 'https://cdn.example.com/results/uuid.jpg' })
  url: string;

  @ApiProperty({ example: 'results/uuid/uuid.jpg' })
  storageKey: string;

  @ApiProperty({ example: 1048576, required: false })
  size?: number | null;

  @ApiProperty({ example: 'uuid-result-id' })
  resultId: string;
}
