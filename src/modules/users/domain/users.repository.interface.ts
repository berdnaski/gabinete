import { UserEntity } from './user.entity';

export abstract class IUsersRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserEntity>;
  abstract claimGuestDemands(userId: string, email: string): Promise<void>;
}
