import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ICabinetInvitationsRepository, CreateInvitationInput } from '../domain/invitations.repository.interface';

@Injectable()
export class CabinetInvitationsRepository implements ICabinetInvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInvitationInput): Promise<void> {
    await this.prisma.cabinetInvitation.upsert({
      where: {
        email_cabinetId: {
          email: data.email,
          cabinetId: data.cabinetId,
        },
      },
      create: {
        email: data.email,
        cabinetId: data.cabinetId,
        role: data.role,
        token: data.token,
        expiresAt: data.expiresAt,
      },
      update: {
        role: data.role,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByEmail(email: string): Promise<any[]> {
    return this.prisma.cabinetInvitation.findMany({
      where: { email },
      include: { cabinet: true },
    });
  }

  async findByToken(token: string): Promise<any | null> {
    return this.prisma.cabinetInvitation.findUnique({
      where: { token },
      include: { cabinet: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cabinetInvitation.delete({
      where: { id },
    });
  }

  async deleteManyByEmail(email: string): Promise<void> {
    await this.prisma.cabinetInvitation.deleteMany({
      where: { email },
    });
  }
}
