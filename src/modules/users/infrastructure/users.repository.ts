import { ConflictException, Injectable } from '@nestjs/common';
import { UserEntity, UserRole } from '../domain/user.entity';
import {
  CreateUserWithAccountData,
  IUsersRepository,
} from '../domain/users.repository.interface';
import { Prisma, UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationHelper } from 'src/shared/application/pagination.helper';
import { PaginatedResult } from 'src/shared/domain/pagination.interface';

type PrismaUserWithMemberCount = Prisma.UserGetPayload<{
  include: { _count: { select: { cabinetMembers: true } } };
}>;

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findFirst({
      where: { email, disabledAt: null },
      include: { _count: { select: { cabinetMembers: true } } },
    });
    return record ? this.toEntity(record) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findFirst({
      where: { id, disabledAt: null },
      include: { _count: { select: { cabinetMembers: true } } },
    });
    return record ? this.toEntity(record) : null;
  }

  async findByIdIncludingDisabled(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findFirst({
      where: { id },
      include: { _count: { select: { cabinetMembers: true } } },
    });
    return record ? this.toEntity(record) : null;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    termsAcceptedAt?: Date;
  }): Promise<UserEntity> {
    try {
      const record = await this.prisma.user.create({
        data,
        include: { _count: { select: { cabinetMembers: true } } },
      });
      return this.toEntity(record);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('O e-mail informado já está em uso');
      }
      throw e;
    }
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
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: {
        user: {
          include: { _count: { select: { cabinetMembers: true } } },
        },
      },
    });

    if (!account?.user) return null;
    return this.toEntity(account.user as PrismaUserWithMemberCount);
  }

  async createWithAccount(
    data: CreateUserWithAccountData,
  ): Promise<UserEntity> {
    const record = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || 'none',
        hasSetPassword: false,
        isVerified: true,
        termsAcceptedAt: data.termsAcceptedAt,
        accounts: {
          create: {
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        },
      },
      include: { _count: { select: { cabinetMembers: true } } },
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
      termsAcceptedAt?: Date;
    },
  ): Promise<UserEntity> {
    const record = await this.prisma.user.update({
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
        termsAcceptedAt: data.termsAcceptedAt,
      },
      include: { _count: { select: { cabinetMembers: true } } },
    });
    return this.toEntity(record);
  }

  async updateRole(id: string, role: UserRole): Promise<UserEntity> {
    const record = await this.prisma.user.update({
      where: { id },
      data: { role },
      include: { _count: { select: { cabinetMembers: true } } },
    });
    return this.toEntity(record);
  }

  async findAll(filters: {
    search?: string;
    role?: UserRole;
    page?: number;
    limit?: number;
    showInactive?: boolean;
  }): Promise<PaginatedResult<UserEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(filters);

    const where: Prisma.UserWhereInput = filters.showInactive
      ? { disabledAt: { not: null } }
      : { disabledAt: null };

    if (filters.role) {
      where.role = filters.role as unknown as PrismaUserRole;
    }

    if (filters.search) {
      where.OR = [
        { id: filters.search },
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
        include: { _count: { select: { cabinetMembers: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((item) =>
        this.toEntity(item as PrismaUserWithMemberCount),
      ),
      total,
    };
  }

  private toEntity(record: PrismaUserWithMemberCount): UserEntity {
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
    entity.termsAcceptedAt = record.termsAcceptedAt;
    entity.isCabinetMember = record._count.cabinetMembers > 0;
    return entity;
  }
}
