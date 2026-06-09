import { UserEntity, UserRole } from './user.entity';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/domain/pagination.interface';

export interface ListUsersFilters extends PaginationParams {
  search?: string;
  role?: UserRole;
  showInactive?: boolean;
}

export interface CreateUserWithAccountData {
  name: string;
  email: string;
  password?: string;
  provider: string;
  providerAccountId: string;
  termsAcceptedAt?: Date;
}

export abstract class IUsersRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByIdIncludingDisabled(id: string): Promise<UserEntity | null>;
  abstract create(data: {
    name: string;
    email: string;
    password: string;
    termsAcceptedAt?: Date;
  }): Promise<UserEntity>;
  abstract claimGuestDemands(userId: string, email: string): Promise<void>;
  abstract findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<UserEntity | null>;
  abstract createWithAccount(
    data: CreateUserWithAccountData,
  ): Promise<UserEntity>;
  abstract linkAccount(data: {
    userId: string;
    provider: string;
    providerAccountId: string;
  }): Promise<void>;
  abstract update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      avatarUrl?: string | null;
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
      disabledAt?: Date | null;
      termsAcceptedAt?: Date;
    },
  ): Promise<UserEntity>;
  abstract updateRole(id: string, role: string): Promise<UserEntity>;
  abstract findAll(
    filters: ListUsersFilters,
  ): Promise<PaginatedResult<UserEntity>>;
}
