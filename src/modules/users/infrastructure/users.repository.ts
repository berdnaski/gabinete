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

type PrismaUserWithMembers = Prisma.UserGetPayload<{
  include: { cabinetMembers: { select: { id: true } } };
}>;

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = (await this.prisma.user.findFirst({
      where: { email, disabledAt: null },
      include: { cabinetMembers: { select: { id: true } } },
    })) as PrismaUserWithMembers | null;
    return record ? this.toEntity(record) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = (await this.prisma.user.findFirst({
      where: { id, disabledAt: null },
      include: { cabinetMembers: { select: { id: true } } },
    })) as PrismaUserWithMembers | null;
    return record ? this.toEntity(record) : null;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserEntity> {
    const record = (await this.prisma.user.create({
      data,
      include: { cabinetMembers: { select: { id: true } } },
    })) as PrismaUserWithMembers;
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
      include: {
        user: {
          include: { cabinetMembers: { select: { id: true } } },
        },
      },
    });

    if (!account?.user) return null;

    return this.toEntity(account.user as PrismaUserWithMembers);
  }

  async createWithAccount(
    data: CreateUserWithAccountData,
  ): Promise<UserEntity> {
    const record = (await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || 'none',
        hasSetPassword: false,
        isVerified: true,
        accounts: {
          create: {
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        },
      },
      include: { cabinetMembers: { select: { id: true } } },
    })) as PrismaUserWithMembers;
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

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      avatarUrl?: string;
      phone?: string;
      address?: string;
      zipcode?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      lat?: number;
      long?: number;
      hasSetPassword?: boolean;
      isVerified?: boolean;
      disabledAt?: Date;
    },
  ): Promise<UserEntity> {
    const record = (await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        password: data.password || undefined,
        avatarUrl: data.avatarUrl,
        isVerified: data.isVerified,
        disabledAt: data.disabledAt,
        phone: data.phone,
        address: data.address,
        zipcode: data.zipcode,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        lat: data.lat,
        long: data.long,
        hasSetPassword: data.hasSetPassword,
      },
      include: { cabinetMembers: { select: { id: true } } },
    })) as PrismaUserWithMembers;
    return this.toEntity(record);
  }

  async updateRole(id: string, role: UserRole): Promise<UserEntity> {
    const record = (await this.prisma.user.update({
      where: { id },
      data: { role },
      include: { cabinetMembers: { select: { id: true } } },
    })) as PrismaUserWithMembers;
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
        include: { cabinetMembers: { select: { id: true } } },
      }) as Promise<PrismaUserWithMembers[]>,
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
    };
  }

  private toEntity(record: PrismaUserWithMembers): UserEntity {
    const entity = new UserEntity();
    entity.id = record.id;
    entity.name = record.name;
    entity.email = record.email;
    entity.password = record.password;
    entity.avatarUrl = record.avatarUrl;
    entity.role = record.role as UserRole;
    entity.isVerified = record.isVerified;
    entity.disabledAt = record.disabledAt;
    entity.phone = record.phone;
    entity.address = record.address;
    entity.zipcode = record.zipcode;
    entity.neighborhood = record.neighborhood;
    entity.city = record.city;
    entity.state = record.state;
    entity.lat = record.lat;
    entity.long = record.long;
    entity.hasSetPassword = record.hasSetPassword;
    entity.isCabinetMember =
      !!record.cabinetMembers && record.cabinetMembers.length > 0;
    return entity;
  }
}
