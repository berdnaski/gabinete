export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  CITIZEN = 'CITIZEN',
}

export class UserEntity {
  id: string;
  name: string;
  email: string;
  password: string | null;
  avatarUrl: string | null;
  phone: string | null;
  address: string | null;
  zipcode: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  long: number | null;
  role: UserRole;
  isVerified: boolean;
  hasSetPassword: boolean;
  isCabinetMember: boolean;
  disabledAt: Date | null;
}
