import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserNeighborhoodEntity } from '../domain/user-neighborhood.entity';
import {
  CreateUserNeighborhoodData,
  IUserNeighborhoodsRepository,
} from '../domain/user-neighborhoods.repository.interface';

@Injectable()
export class UserNeighborhoodsRepository implements IUserNeighborhoodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserNeighborhoodEntity[]> {
    const records = await this.prisma.userNeighborhood.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
    return records.map(this.toEntity);
  }

  async findById(id: string): Promise<UserNeighborhoodEntity | null> {
    const record = await this.prisma.userNeighborhood.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByLocation(
    userId: string,
    neighborhood: string,
    city: string,
    state: string,
  ): Promise<UserNeighborhoodEntity | null> {
    const record = await this.prisma.userNeighborhood.findUnique({
      where: { userId_neighborhood_city_state: { userId, neighborhood, city, state } },
    });
    return record ? this.toEntity(record) : null;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.userNeighborhood.count({ where: { userId } });
  }

  async create(data: CreateUserNeighborhoodData): Promise<UserNeighborhoodEntity> {
    try {
      const record = await this.prisma.userNeighborhood.create({ data });
      return this.toEntity(record);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Neighborhood already saved');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userNeighborhood.delete({ where: { id } });
  }

  async clearPrimary(userId: string): Promise<void> {
    await this.prisma.userNeighborhood.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  async setPrimary(id: string): Promise<void> {
    await this.prisma.userNeighborhood.update({
      where: { id },
      data: { isPrimary: true },
    });
  }

  private toEntity(record: {
    id: string;
    userId: string;
    neighborhood: string;
    city: string;
    state: string;
    label: string | null;
    isPrimary: boolean;
    createdAt: Date;
  }): UserNeighborhoodEntity {
    const entity = new UserNeighborhoodEntity();
    entity.id = record.id;
    entity.userId = record.userId;
    entity.neighborhood = record.neighborhood;
    entity.city = record.city;
    entity.state = record.state;
    entity.label = record.label;
    entity.isPrimary = record.isPrimary;
    entity.createdAt = record.createdAt;
    return entity;
  }
}
