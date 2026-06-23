import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ToggleTestimonialVisibilityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(demandId: string, cabinetId: string, hidden: boolean): Promise<void> {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
      select: { id: true, cabinetId: true, surveySubmittedAt: true },
    });

    if (!demand || demand.cabinetId !== cabinetId) {
      throw new NotFoundException('Depoimento não encontrado.');
    }

    if (!demand.surveySubmittedAt) {
      throw new ForbiddenException('Esta demanda não possui depoimento.');
    }

    await this.prisma.demand.update({
      where: { id: demandId },
      data: { surveyHidden: hidden },
    });
  }
}
