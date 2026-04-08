import { TokenType } from '@prisma/client';

export class TokenEntity {
  id: string;
  userId: string;
  type: TokenType;
  expiresAt: Date;
  createdAt: Date;
}
