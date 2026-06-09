import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { MailService, DemandStatusUpdateParams } from '../application/mail.service';

@Injectable()
export class ResendMailService implements MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(ResendMailService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = new Resend(apiKey);

    this.fromEmail = process.env.MAIL_FROM || 'onboarding@resend.dev';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${this.frontendUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Gabinete - Confirme seu e-mail',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bem-vindo(a) ao Gabinete!</h2>
            <p>Ficamos felizes em ter vocÃª a bordo.</p>
            <p>Para ativar sua conta e provar que vocÃª Ã© dono(a) deste e-mail, por favor clique no link abaixo:</p>
            <p style="margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Confirmar meu e-mail
              </a>
            </p>
            <p>Se o botÃ£o nÃ£o funcionar, cole este link em seu navegador:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <br/>
            <p>Se vocÃª nÃ£o criou essa conta, apenas ignore este e-mail.</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Gabinete - RecuperaÃ§Ã£o de Senha',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>RecuperaÃ§Ã£o de Senha</h2>
            <p>Recebemos um pedido para alterar sua senha no Gabinete.</p>
            <p>Clique no botÃ£o abaixo para escolher uma nova senha. O link Ã© vÃ¡lido por breve momento.</p>
            <p style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Renovar minha senha
              </a>
            </p>
            <p>Se vocÃª nÃ£o fez essa solicitaÃ§Ã£o, pode ignorar este e-mail tranquilamente.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordChangeConfirmationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const confirmationLink = `${this.frontendUrl}/confirm-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Gabinete - ConfirmaÃ§Ã£o de Troca de Senha',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>ConfirmaÃ§Ã£o de AlteraÃ§Ã£o</h2>
            <p>Recebemos uma solicitaÃ§Ã£o para alterar a senha da sua conta.</p>
            <p>Por favor, clique no botÃ£o abaixo para confirmar essa alteraÃ§Ã£o. Se vocÃª nÃ£o solicitou isso, ignore este e-mail.</p>
            <p style="margin: 30px 0;">
              <a href="${confirmationLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Confirmar AlteraÃ§Ã£o de Senha
              </a>
            </p>
            <p>Se o botÃ£o nÃ£o funcionar, cole este link em seu navegador:</p>
            <p><a href="${confirmationLink}">${confirmationLink}</a></p>
          </div>
        `,
      });
      this.logger.log(`Password change confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password change confirmation email to ${email}`,
        error,
      );
      throw error;
    }
  }

  async sendDemandStatusUpdate(
    email: string,
    params: DemandStatusUpdateParams,
  ): Promise<void> {
    const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
      IN_ANALYSIS:  { label: 'Em AnÃ¡lise',    color: '#3b82f6', emoji: 'ðŸ”' },
      IN_PROGRESS:  { label: 'Em Progresso',  color: '#f59e0b', emoji: 'âš™ï¸' },
      RESOLVED:     { label: 'Resolvida',     color: '#16a34a', emoji: 'âœ…' },
      REJECTED:     { label: 'Rejeitada',     color: '#dc2626', emoji: 'âŒ' },
      CANCELED:     { label: 'Cancelada',     color: '#6b7280', emoji: 'ðŸš«' },
      SUBMITTED:    { label: 'Enviada',       color: '#0058F3', emoji: 'ðŸ“‹' },
    };

    const statusInfo = STATUS_LABELS[params.newStatus] ?? { label: params.newStatus, color: '#0058F3', emoji: 'ðŸ“‹' };
    const isResolved = params.newStatus === 'RESOLVED';

    const surveySection = isResolved && params.surveyUrl ? `
      <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #166534; font-weight: 600;">â­ Nos ajude com seu feedback</p>
        <p style="margin: 0 0 16px; font-size: 14px; color: #15803d;">Sua demanda foi resolvida! Avalie o atendimento que vocÃª recebeu â€” leva menos de 1 minuto.</p>
        <a href="${params.surveyUrl}" style="display: inline-block; background: #16a34a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
          Avaliar atendimento
        </a>
      </div>
    ` : '';

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `${statusInfo.emoji} Sua demanda foi atualizada â€” ${params.cabinetName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #fff;">
            <div style="background: ${statusInfo.color}; padding: 24px 32px;">
              <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">Gabinete App</p>
              <h1 style="margin: 8px 0 0; color: #fff; font-size: 22px; font-weight: 700;">AtualizaÃ§Ã£o de Demanda</h1>
            </div>
            <div style="padding: 32px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Demanda</p>
              <p style="margin: 0 0 24px; font-size: 16px; font-weight: 600; color: #111827;">${params.demandTitle}</p>
              <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: ${statusInfo.color}15; border: 1px solid ${statusInfo.color}40; border-radius: 9999px;">
                <span style="font-size: 14px; font-weight: 700; color: ${statusInfo.color};">${statusInfo.emoji} ${statusInfo.label}</span>
              </div>
              ${surveySection}
              <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af;">Este e-mail foi enviado pelo ${params.cabinetName} via Gabinete App. Se vocÃª nÃ£o reconhece esta demanda, ignore este e-mail.</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Demand status update email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send demand status update email to ${email}`, error);
    }
  }

  async sendCabinetInvitation(
    email: string,
    token: string,
    cabinetName: string,
    senderName: string,
  ): Promise<void> {
    const inviteLink = `${this.frontendUrl}/cabinets/invites/${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `Convite para participar do gabinete: ${cabinetName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>VocÃª foi convidado(a)!</h2>
            <p>OlÃ¡,</p>
            <p><strong>${senderName}</strong> convidou vocÃª para fazer parte do gabinete <strong>${cabinetName}</strong> no sistema Gabinete.</p>
            <p>Ao aceitar, vocÃª poderÃ¡ colaborar na gestÃ£o de demandas e resultados deste gabinete.</p>
            <p style="margin: 30px 0;">
              <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ver Convite e Aceitar
              </a>
            </p>
            <p>Se o botÃ£o nÃ£o funcionar, cole este link em seu navegador:</p>
            <p><a href="${inviteLink}">${inviteLink}</a></p>
            <br/>
            <p>Se vocÃª nÃ£o conhece quem te convidou, pode ignorar este e-mail.</p>
          </div>
        `,
      });
      this.logger.log(`Cabinet invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send cabinet invitation email to ${email}`,
        error,
      );
      throw error;
    }
  }
}

