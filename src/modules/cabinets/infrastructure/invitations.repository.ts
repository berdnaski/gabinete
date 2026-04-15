import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  ICabinetInvitationsRepository,
  CreateInvitationInput,
} from '../domain/invitations.repository.interface';
import { CabinetInvitationEntity } from '../domain/cabinet-invitation.entity';
import { CabinetRole } from '../domain/cabinet-role.enum';

type PrismaInvitationWithCabinet = Prisma.CabinetInvitationGetPayload<{
  include: {
    cabinet: { select: { id: true; name: true; slug: true; avatarUrl: true } };
  };
}>;

type PrismaInvitation = Prisma.CabinetInvitationGetPayload<
  Record<string, never>
>;

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

  async findByEmail(email: string): Promise<CabinetInvitationEntity[]> {
    const records = await this.prisma.cabinetInvitation.findMany({
      where: { email },
      include: {
        cabinet: {
          select: { id: true, name: true, slug: true, avatarUrl: true },
        },
      },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByToken(token: string): Promise<CabinetInvitationEntity | null> {
    const record = await this.prisma.cabinetInvitation.findUnique({
      where: { token },
      include: {
        cabinet: {
          select: { id: true, name: true, slug: true, avatarUrl: true },
        },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async findById(id: string): Promise<CabinetInvitationEntity | null> {
    const record = await this.prisma.cabinetInvitation.findUnique({
      where: { id },
      include: {
        cabinet: {
          select: { id: true, name: true, slug: true, avatarUrl: true },
        },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async findByCabinetId(cabinetId: string): Promise<CabinetInvitationEntity[]> {
    const records = await this.prisma.cabinetInvitation.findMany({
      where: { cabinetId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toEntityWithoutCabinet(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cabinetInvitation.delete({ where: { id } });
  }

  async deleteManyByEmail(email: string): Promise<void> {
    await this.prisma.cabinetInvitation.deleteMany({ where: { email } });
  }

  private toEntity(
    record: PrismaInvitationWithCabinet,
  ): CabinetInvitationEntity {
    const entity = new CabinetInvitationEntity();
    entity.id = record.id;
    entity.email = record.email;
    entity.cabinetId = record.cabinetId;
    entity.role = record.role as CabinetRole;
    entity.token = record.token;
    entity.expiresAt = record.expiresAt;
    entity.createdAt = record.createdAt;
    entity.cabinet = record.cabinet ?? undefined;
    return entity;
  }

  private toEntityWithoutCabinet(
    record: PrismaInvitation,
  ): CabinetInvitationEntity {
    const entity = new CabinetInvitationEntity();
    entity.id = record.id;
    entity.email = record.email;
    entity.cabinetId = record.cabinetId;
    entity.role = record.role as CabinetRole;
    entity.token = record.token;
    entity.expiresAt = record.expiresAt;
    entity.createdAt = record.createdAt;
    return entity;
  }
}
