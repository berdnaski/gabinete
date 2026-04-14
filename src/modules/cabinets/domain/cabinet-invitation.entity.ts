import { CabinetRole } from './cabinet-role.enum';

export class CabinetInvitationEntity {
  id: string;
  email: string;
  cabinetId: string;
  role: CabinetRole;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  cabinet?: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
  };
}
