export abstract class MailService {
  abstract sendVerificationEmail(email: string, token: string): Promise<void>;
  abstract sendPasswordResetEmail(email: string, token: string): Promise<void>;
  abstract sendPasswordChangeConfirmationEmail(
    email: string,
    token: string,
  ): Promise<void>;
}
