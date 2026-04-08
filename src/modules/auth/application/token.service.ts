import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TokenType } from '@prisma/client';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}

  async generateToken(
    userId: string,
    type: TokenType,
    expiresInMinutes = 1440,
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const { id } = await this.prisma.token.upsert({
      where: { userId_type: { userId, type } },
      update: { expiresAt },
      create: { userId, type, expiresAt },
    });

    return id;
  }

  async validateToken(id: string, type: TokenType): Promise<string | null> {
    const record = await this.prisma.token.findFirst({
      where: {
        id,
        type,
        expiresAt: { gt: new Date() },
      },
      select: { userId: true },
    });

    return record?.userId ?? null;
  }

  async deleteToken(id: string): Promise<void> {
    await this.prisma.token.deleteMany({ where: { id } });
  }
}
