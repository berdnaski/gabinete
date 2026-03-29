import { CabinetRole } from './cabinet-role.enum';

export class CabinetMemberEntity {
  id: string;
  userId: string;
  cabinetId: string;
  role: CabinetRole;
}
