import { TokenType } from '@prisma/client';
import { TokenEntity } from './token.entity';

export abstract class ITokensRepository {
  abstract upsert(data: {
    userId: string;
    type: TokenType;
    expiresAt: Date;
    payload?: string;
  }): Promise<TokenEntity>;

  abstract findValidToken(
    id: string,
    type: TokenType,
  ): Promise<TokenEntity | null>;

  abstract findValidTokenByPayload(
    payload: string,
    type: TokenType,
  ): Promise<TokenEntity | null>;

  abstract delete(id: string): Promise<void>;
}
