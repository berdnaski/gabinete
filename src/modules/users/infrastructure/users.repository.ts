import { Injectable } from '@nestjs/common';
import { UserEntity, UserRole } from '../domain/user.entity';
import { CreateUserWithAccountData, IUsersRepository } from '../domain/users.repository.interface';
import { PrismaService } from 'src/modules/database/prisma.service';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) { }

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

  async createWithAccount(data: CreateUserWithAccountData): Promise<UserEntity> {
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

  private toEntity(record: {
    id: string;
    name: string;
    email: string;
    password: string | null;
    avatarUrl: string | null;
    role: string;
    disabledAt: Date | null;
  }): UserEntity {
    const entity = new UserEntity();
    entity.id = record.id;
    entity.name = record.name;
    entity.email = record.email;
    entity.password = record.password;
    entity.avatarUrl = record.avatarUrl;
    entity.role = record.role as UserRole;
    entity.disabledAt = record.disabledAt;
    return entity;
  }
}
