export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class UserEntity {
  id: string;
  name: string;
  email: string;
  password: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  disabledAt: Date | null;
}
