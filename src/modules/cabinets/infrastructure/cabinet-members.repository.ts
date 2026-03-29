import { ConflictException, Injectable } from '@nestjs/common';
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
    try {
      const record = await this.prisma.cabinetMember.create({ data });
      return this.toEntity(record);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('User is already a member of this cabinet');
      }
      throw err;
    }
  }

  async remove(cabinetId: string, userId: string): Promise<void> {
    await this.prisma.cabinetMember.deleteMany({
      where: { cabinetId, userId },
    });
  }

  async findByCabinetId(cabinetId: string): Promise<CabinetMemberEntity[]> {
    const records = await this.prisma.cabinetMember.findMany({
      where: { cabinetId },
    });
    return records.map((r) => this.toEntity(r));
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
