import { ResultType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ResultImageEntity } from './result-image.entity';

export class ResultCabinetInfo {
  @ApiProperty({ example: 'uuid-cabinet-id' })
  id: string;

  @ApiProperty({ example: 'Gabinete Vereador Silva' })
  name: string;

  @ApiProperty({ example: 'gabinete-vereador-silva' })
  slug: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.jpg', nullable: true })
  avatarUrl: string | null;
}

export class ResultDemandInfo {
  @ApiProperty({ example: 'uuid-demand-id' })
  id: string;

  @ApiProperty({ example: 'Buraco na Rua Principal' })
  title: string;
}

export class ResultEntity {
  @ApiProperty({ example: 'uuid-result-id' })
  id: string;

  @ApiProperty({ example: 'Recapeamento concluído na Rua Principal' })
  title: string;

  @ApiProperty({ example: 'Executamos o recapeamento asfáltico no trecho indicado...' })
  description: string;

  @ApiProperty({ enum: ResultType })
  type: ResultType;

  @ApiProperty({ example: 'uuid-cabinet-id' })
  cabinetId: string;

  @ApiProperty({ example: 'uuid-demand-id', nullable: true })
  demandId: string | null;

  @ApiProperty({ example: 'results/uuid/protocol/uuid.pdf', nullable: true })
  protocolFileKey: string | null;

  @ApiProperty({ example: 'https://cdn.example.com/results/uuid/protocol/uuid.pdf', nullable: true })
  protocolFileUrl: string | null;

  @ApiProperty({ example: 'ordem-servico-123.pdf', nullable: true })
  protocolFileName: string | null;

  @ApiProperty({ example: 'application/pdf', nullable: true })
  protocolFileMimeType: string | null;

  @ApiProperty({ example: 204800, nullable: true })
  protocolFileSize: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  disabledAt: Date | null;

  @ApiProperty({ type: [ResultImageEntity], required: false })
  images?: ResultImageEntity[];

  @ApiProperty({ type: ResultCabinetInfo, required: false })
  cabinet?: ResultCabinetInfo;

  @ApiProperty({ type: ResultDemandInfo, required: false, nullable: true })
  demand?: ResultDemandInfo | null;
}
