import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DemandStatus } from '@prisma/client';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

const SCORE_PER_RESOLVED = 10;
const SCORE_PER_IN_PROGRESS = 2;

@Injectable()
export class CabinetScoringListener {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  @OnEvent('demand.status-changed')
  async handleStatusChanged(payload: {
    cabinetId: string | null;
    newStatus: string;
    previousStatus: string;
  }) {
    if (!payload.cabinetId) return;

    const { cabinetId, newStatus, previousStatus } = payload;
    const deltas = { score: 0, inProgressDelta: 0, resolvedDelta: 0 };

    // Leaving IN_PROGRESS
    if (previousStatus === DemandStatus.IN_PROGRESS) {
      if (newStatus !== DemandStatus.RESOLVED) {
        deltas.score -= SCORE_PER_IN_PROGRESS;
      }
      deltas.inProgressDelta -= 1;
    }

    // Leaving RESOLVED
    if (previousStatus === DemandStatus.RESOLVED) {
      deltas.score -= SCORE_PER_RESOLVED;
      deltas.resolvedDelta -= 1;
    }

    // Entering IN_PROGRESS
    if (newStatus === DemandStatus.IN_PROGRESS) {
      deltas.score += SCORE_PER_IN_PROGRESS;
      deltas.inProgressDelta += 1;
    }

    // Entering RESOLVED
    if (newStatus === DemandStatus.RESOLVED) {
      deltas.score += SCORE_PER_RESOLVED;
      deltas.resolvedDelta += 1;
    }

    await this.cabinetsRepository.updateScoreCounters(cabinetId, deltas);
  }
}
