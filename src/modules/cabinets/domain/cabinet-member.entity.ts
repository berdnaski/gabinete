import { CabinetRole } from './cabinet-role.enum';

export class CabinetMemberEntity {
  id: string;
  userId: string;
  cabinetId: string;
  role: CabinetRole;
  userName?: string;
  userAvatarUrl?: string | null;
  userEmail?: string | null;
}
