import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CabinetMemberEntity } from '../domain/cabinet-member.entity';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

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

  private toEntity(record: {
    id: string;
    userId: string;
    cabinetId: string;
    role: string;
  }): CabinetMemberEntity {
    const entity = new CabinetMemberEntity();
    entity.id = record.id;
    entity.userId = record.userId;
    entity.cabinetId = record.cabinetId;
    entity.role = record.role as CabinetRole;
    return entity;
  }
}
