import { ApiProperty } from '@nestjs/swagger';

export class HeatmapPointDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: -18.9113 })
  lat: number;

  @ApiProperty({ example: -48.2622 })
  lng: number;

  @ApiProperty({ example: 1 })
  weight: number;

  @ApiProperty({ example: 'Buraco na rua principal' })
  title: string;

  @ApiProperty({ example: 'IN_PROGRESS' })
  status: string;

  @ApiProperty({ example: 'Infraestrutura' })
  categoryName: string;

  @ApiProperty({ example: 'Centro', nullable: true })
  neighborhood: string | null;
}

export class HeatmapInsightDto {
  @ApiProperty({ example: 'Luizote de Freitas' })
  topNeighborhood: string;

  @ApiProperty({ example: 7 })
  occurrenceCount: number;

  @ApiProperty({
    example:
      'Bairro Luizote de Freitas apresenta maior densidade de ocorrências urgentes (7).',
  })
  text: string;
}

export class GetCabinetDemandHeatmapResponseDto {
  @ApiProperty({ type: [HeatmapPointDto] })
  points: HeatmapPointDto[];

  @ApiProperty({ type: HeatmapInsightDto })
  insight: HeatmapInsightDto;
}
