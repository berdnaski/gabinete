import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CabinetMemberEntity } from '../domain/cabinet-member.entity';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

type RawMember = {
  id: string;
  userId: string;
  cabinetId: string;
  role: string;
  user?: { name: string; avatarUrl: string | null } | null;
};

@Injectable()
export class CabinetMembersRepository implements ICabinetMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(data: {
    userId: string;
    cabinetId: string;
    role: CabinetRole;
  }): Promise<CabinetMemberEntity> {
    const record = await this.prisma.cabinetMember.create({ data });
    return this.toEntity(record);
  }

  async remove(cabinetId: string, userId: string): Promise<void> {
    await this.prisma.cabinetMember.deleteMany({
      where: { cabinetId, userId },
    });
  }

  async findByUserId(
    userId: string,
    roles?: CabinetRole[],
  ): Promise<CabinetMemberEntity[]> {
    const records = await this.prisma.cabinetMember.findMany({
      where: {
        userId,
        role: roles?.length ? { in: roles } : undefined,
      },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByCabinetId(cabinetId: string): Promise<CabinetMemberEntity[]> {
    const records = await this.prisma.cabinetMember.findMany({
      where: { cabinetId },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<CabinetMemberEntity | null> {
    const record = await this.prisma.cabinetMember.findUnique({
      where: { id },
    });
    return record ? this.toEntity(record) : null;
  }

  async findMembership(
    userId: string,
    cabinetId: string,
  ): Promise<CabinetMemberEntity | null> {
    const record = await this.prisma.cabinetMember.findUnique({
      where: { userId_cabinetId: { userId, cabinetId } },
    });
    return record ? this.toEntity(record) : null;
  }

  async updateRole(
    userId: string,
    cabinetId: string,
    role: CabinetRole,
  ): Promise<void> {
    await this.prisma.cabinetMember.update({
      where: { userId_cabinetId: { userId, cabinetId } },
      data: { role },
    });
  }

  private toEntity(record: RawMember): CabinetMemberEntity {
    const entity = new CabinetMemberEntity();
    entity.id = record.id;
    entity.userId = record.userId;
    entity.cabinetId = record.cabinetId;
    entity.role = record.role as CabinetRole;
    entity.userName = record.user?.name;
    entity.userAvatarUrl = record.user?.avatarUrl ?? null;
    return entity;
  }
}
