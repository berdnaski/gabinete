import { UserEntity } from './user.entity';

export interface CreateUserWithAccountData {
  name: string;
  email: string;
  password?: string;
  provider: string;
  providerAccountId: string;
}

export abstract class IUsersRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserEntity>;
  abstract claimGuestDemands(userId: string, email: string): Promise<void>;
  abstract findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<UserEntity | null>;
  abstract createWithAccount(data: CreateUserWithAccountData): Promise<UserEntity>;
  abstract linkAccount(data: {
    userId: string;
    provider: string;
    providerAccountId: string;
  }): Promise<void>;
}
