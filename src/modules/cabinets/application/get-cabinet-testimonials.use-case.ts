import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GetCabinetTestimonialsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  private toDto(demand: any, includeHidden = false) {
    return {
      id: demand.id,
      title: demand.title,
      surveyRating: demand.surveyRating,
      surveyComment: demand.surveyComment,
      surveySubmittedAt: demand.surveySubmittedAt?.toISOString() ?? null,
      reporterName: demand.reporter?.name ?? 'Cidadão',
      reporterAvatarUrl: demand.reporter?.avatarUrl ?? null,
      ...(includeHidden ? { surveyHidden: demand.surveyHidden } : {}),
    };
  }

  async execute(cabinetId: string) {
    const demands = await this.prisma.demand.findMany({
      where: {
        cabinetId,
        disabledAt: null,
        surveySubmittedAt: { not: null },
        surveyRating: { gte: 4 },
        surveyComment: { not: null },
        surveyHidden: false,
      },
      orderBy: { surveySubmittedAt: 'desc' },
      take: 9,
      include: { reporter: { select: { name: true, avatarUrl: true } } },
    });

    return demands
      .filter((d) => d.surveyComment?.trim())
      .map((d) => this.toDto(d));
  }

  async executeAll(cabinetId: string) {
    const demands = await this.prisma.demand.findMany({
      where: {
        cabinetId,
        disabledAt: null,
        surveySubmittedAt: { not: null },
        surveyRating: { gte: 4 },
        surveyComment: { not: null },
      },
      orderBy: { surveySubmittedAt: 'desc' },
      take: 50,
      include: { reporter: { select: { name: true, avatarUrl: true } } },
    });

    return demands
      .filter((d) => d.surveyComment?.trim())
      .map((d) => this.toDto(d, true));
  }
}
