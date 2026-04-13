import { DemandStatus, DemandPriority } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { DemandEvidenceEntity } from './demand-evidence.entity';

export class DemandReporterInfo {
  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.jpg',
    nullable: true,
  })
  avatarUrl: string | null;
}

export class DemandCategoryInfo {
  @ApiProperty({ example: 'Infrastructure' })
  name: string;
}

export class DemandEntity {
  @ApiProperty({ example: 'uuid-demand-id' })
  id: string;

  @ApiProperty({ example: 'Pothole on Main Street' })
  title: string;

  @ApiProperty({
    example:
      'The asphalt cracked and formed a crater near the traffic light...',
  })
  description: string;

  @ApiProperty({ enum: DemandStatus })
  status: DemandStatus;

  @ApiProperty({ enum: DemandPriority })
  priority: DemandPriority;

  @ApiProperty({ example: 'Main Street, 123' })
  address: string;

  @ApiProperty({ example: '12345-678' })
  zipcode: string;

  @ApiProperty({ example: -23.55052, nullable: true })
  lat: number | null;

  @ApiProperty({ example: -46.633308, nullable: true })
  long: number | null;

  @ApiProperty({ example: 'Downtown' })
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo' })
  city: string;

  @ApiProperty({ example: 'SP' })
  state: string;

  @ApiProperty({ example: 'uuid-reporter-id', nullable: true })
  reporterId: string | null;

  @ApiProperty({ example: 'guest@example.com', nullable: true })
  guestEmail: string | null;

  @ApiProperty({ example: 'uuid-cabinet-id', nullable: true })
  cabinetId: string | null;

  @ApiProperty({ example: 'uuid-category-id', nullable: true })
  categoryId: string | null;

  @ApiProperty({ example: 'uuid-member-id', nullable: true })
  assigneeMemberId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  disabledAt: Date | null;

  @ApiProperty({ type: [DemandEvidenceEntity], required: false })
  evidences?: DemandEvidenceEntity[];

  @ApiProperty({ type: DemandReporterInfo, required: false, nullable: true })
  reporter?: DemandReporterInfo | null;

  @ApiProperty({ type: DemandCategoryInfo, required: false, nullable: true })
  category?: DemandCategoryInfo | null;

  @ApiProperty({ example: 42 })
  likesCount: number = 0;

  @ApiProperty({ example: false })
  isLiked: boolean = false;
}
