import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { TokenEntity } from '../domain/token.entity';
import { TokenType } from '@prisma/client';

@Injectable()
export class TokensRepository implements ITokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: {
    userId: string;
    type: TokenType;
    expiresAt: Date;
    payload?: string;
  }): Promise<TokenEntity> {
    const record = await this.prisma.token.upsert({
      where: {
        userId_type: { userId: data.userId, type: data.type },
      },
      update: {
        expiresAt: data.expiresAt,
        payload: data.payload || null,
      },
      create: {
        userId: data.userId,
        type: data.type,
        expiresAt: data.expiresAt,
        payload: data.payload || null,
      },
    });

    return record as TokenEntity;
  }

  async findValidToken(
    id: string,
    type: TokenType,
  ): Promise<TokenEntity | null> {
    const record = await this.prisma.token.findFirst({
      where: {
        id,
        type,
        expiresAt: { gt: new Date() },
      },
    });

    return record ? (record as TokenEntity) : null;
  }

  async findValidTokenByPayload(
    payload: string,
    type: TokenType,
  ): Promise<TokenEntity | null> {
    const record = await this.prisma.token.findFirst({
      where: {
        payload,
        type,
        expiresAt: { gt: new Date() },
      },
    });

    return record ? (record as TokenEntity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.token.deleteMany({ where: { id } });
  }

  async deleteByUserAndType(userId: string, type: TokenType): Promise<void> {
    await this.prisma.token.deleteMany({
      where: {
        userId,
        type,
      },
    });
  }
}
