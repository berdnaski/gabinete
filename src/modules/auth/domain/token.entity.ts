import { TokenType } from '@prisma/client';

export class TokenEntity {
  id: string;
  userId: string;
  type: TokenType;
  payload: string | null;
  expiresAt: Date;
  createdAt: Date;
}
