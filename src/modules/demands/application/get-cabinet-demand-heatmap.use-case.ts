import { Injectable } from '@nestjs/common';
import { DemandPriority } from '@prisma/client';
import {
  HeatmapData,
  HeatmapPoint,
  IDemandsRepository,
} from '../domain/demands.repository.interface';
import { subDays } from 'date-fns';

@Injectable()
export class GetCabinetDemandHeatmapUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(): Promise<HeatmapData> {
    const rawPoints = await this.demandsRepository.getRawHeatmapPoints(
      subDays(new Date(), 30),
    );

    const counts: Record<string, number> = {};
    let topName = 'N/A';
    let topCount = 0;

    const points: HeatmapPoint[] = rawPoints.map((p) => {
      if (p.neighborhood) {
        const count = (counts[p.neighborhood] || 0) + 1;
        counts[p.neighborhood] = count;
        if (count > topCount) {
          topCount = count;
          topName = p.neighborhood;
        }
      }

      return {
        id: p.id,
        lat: p.lat,
        lng: p.long,
        weight: p.priority === DemandPriority.URGENT ? 3 : 1,
        title: p.title,
        status: p.status,
        categoryName: p.categoryName,
        neighborhood: p.neighborhood,
      };
    });

    return {
      points,
      insight: {
        topNeighborhood: topName,
        occurrenceCount: topCount,
        text: `Bairro ${topName} apresenta maior densidade de ocorrências (${topCount}).`,
      },
    };
  }
}
