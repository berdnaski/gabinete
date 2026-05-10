import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../../../shared/mail/application/mail.service';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import { IDemandsRepository } from '../domain/demands.repository.interface';

interface StatusChangedPayload {
  userId: string | null;
  demandId: string;
  title: string;
  newStatus: string;
  cabinetId: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  surveyToken?: string | null;
}

@Injectable()
export class DemandEmailListener {
  private readonly logger = new Logger(DemandEmailListener.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailService: MailService,
    private readonly usersRepository: IUsersRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly demandsRepository: IDemandsRepository,
  ) {
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  @OnEvent('demand.status-changed')
  async handleStatusChanged(payload: StatusChangedPayload): Promise<void> {
    try {
      const recipientEmail = await this.resolveEmail(payload);
      if (!recipientEmail) return;

      const cabinetName = payload.cabinetId
        ? (await this.cabinetsRepository.findById(payload.cabinetId))?.name ?? 'Gabinete'
        : 'Gabinete';

      const surveyUrl = payload.surveyToken
        ? `${this.frontendUrl}/pesquisa/${payload.surveyToken}`
        : undefined;

      await this.mailService.sendDemandStatusUpdate(recipientEmail, {
        demandTitle: payload.title,
        newStatus: payload.newStatus,
        cabinetName,
        surveyUrl,
      });
    } catch (error) {
      this.logger.error(`Failed to send status update email for demand ${payload.demandId}`, error);
    }
  }

  private async resolveEmail(payload: StatusChangedPayload): Promise<string | null> {
    if (payload.userId) {
      const user = await this.usersRepository.findById(payload.userId);
      return user?.email ?? null;
    }

    const contact = await this.demandsRepository.findContactInfo(payload.demandId);
    return contact?.guestEmail ?? null;
  }
}
