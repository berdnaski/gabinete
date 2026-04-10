import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { MailService } from '../application/mail.service';

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
            <p>Ficamos felizes em ter você a bordo.</p>
            <p>Para ativar sua conta e provar que você é dono(a) deste e-mail, por favor clique no link abaixo:</p>
            <p style="margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Confirmar meu e-mail
              </a>
            </p>
            <p>Se o botão não funcionar, cole este link em seu navegador:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <br/>
            <p>Se você não criou essa conta, apenas ignore este e-mail.</p>
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
        subject: 'Gabinete - Recuperação de Senha',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recuperação de Senha</h2>
            <p>Recebemos um pedido para alterar sua senha no Gabinete.</p>
            <p>Clique no botão abaixo para escolher uma nova senha. O link é válido por breve momento.</p>
            <p style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Renovar minha senha
              </a>
            </p>
            <p>Se você não fez essa solicitação, pode ignorar este e-mail tranquilamente.</p>
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
        subject: 'Gabinete - Confirmação de Troca de Senha',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Confirmação de Alteração</h2>
            <p>Recebemos uma solicitação para alterar a senha da sua conta.</p>
            <p>Por favor, clique no botão abaixo para confirmar essa alteração. Se você não solicitou isso, ignore este e-mail.</p>
            <p style="margin: 30px 0;">
              <a href="${confirmationLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Confirmar Alteração de Senha
              </a>
            </p>
            <p>Se o botão não funcionar, cole este link em seu navegador:</p>
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
}
