import { ApiProperty } from '@nestjs/swagger';

export class DemandEvidenceEntity {
  @ApiProperty({ example: 'uuid-evidence-id' })
  id: string;

  @ApiProperty({ example: 'demands/uuid/filename.jpg' })
  storageKey: string;

  @ApiProperty({ example: 'https://cdn.example.com/demands/uuid/filename.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 204800, nullable: true })
  size: number | null;

  @ApiProperty({ example: 'uuid-demand-id' })
  demandId: string;
}
