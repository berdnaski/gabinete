import { Injectable } from '@nestjs/common';
import { UserEntity, UserRole } from '../domain/user.entity';
import {
  CreateUserWithAccountData,
  IUsersRepository,
} from '../domain/users.repository.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationHelper } from 'src/shared/application/pagination.helper';
import { PaginatedResult } from 'src/shared/domain/pagination.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findFirst({
      where: { email, disabledAt: null },
    });
    return record ? this.toEntity(record) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findFirst({
      where: { id, disabledAt: null },
    });
    return record ? this.toEntity(record) : null;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserEntity> {
    const record = await this.prisma.user.create({ data });
    return this.toEntity(record);
  }

  async claimGuestDemands(userId: string, email: string): Promise<void> {
    await this.prisma.demand.updateMany({
      where: { guestEmail: email, reporterId: null },
      data: { reporterId: userId, guestEmail: null },
    });
  }

  async findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<UserEntity | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });
    return account?.user ? this.toEntity(account.user) : null;
  }

  async createWithAccount(
    data: CreateUserWithAccountData,
  ): Promise<UserEntity> {
    const record = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || 'none',
        accounts: {
          create: {
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        },
      },
    });
    return this.toEntity(record);
  }

  async linkAccount(data: {
    userId: string;
    provider: string;
    providerAccountId: string;
  }): Promise<void> {
    await this.prisma.account.create({
      data: {
        userId: data.userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
      },
    });
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const record = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        password: data.password || undefined,
        avatarUrl: data.avatarUrl,
        role: data.role,
        isVerified: data.isVerified,
        disabledAt: data.disabledAt,
      },
    });
    return this.toEntity(record);
  }

  async findAll(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<UserEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(filters);

    const where: Prisma.UserWhereInput = {
      disabledAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
    };
  }

  private toEntity(record: {
    id: string;
    name: string;
    email: string;
    password: string | null;
    avatarUrl: string | null;
    role: string;
    isVerified: boolean;
    disabledAt: Date | null;
  }): UserEntity {
    const entity = new UserEntity();
    entity.id = record.id;
    entity.name = record.name;
    entity.email = record.email;
    entity.password = record.password;
    entity.avatarUrl = record.avatarUrl;
    entity.role = record.role as UserRole;
    entity.isVerified = record.isVerified;
    entity.disabledAt = record.disabledAt;
    return entity;
  }
}
