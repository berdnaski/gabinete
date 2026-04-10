export enum QueueName {
  DEFAULT = 'default',
}

export enum JobName {
  SEND_EMAIL = 'send-email',
  CLEANUP_EXPIRED_TOKENS = 'cleanup-expired-tokens',
}

export enum CronExpression {
  EVERY_DAY_AT_MIDNIGHT = '0 0 * * *',
  EVERY_DAY_AT_3AM = '0 3 * * *',
}

export enum EmailType {
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password-reset',
  PASSWORD_CHANGE = 'password-change',
}
