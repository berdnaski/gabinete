import { CabinetMemberEntity } from './cabinet-member.entity';
import { CabinetRole } from './cabinet-role.enum';

export abstract class ICabinetMembersRepository {
  abstract add(data: {
    userId: string;
    cabinetId: string;
    role: CabinetRole;
  }): Promise<CabinetMemberEntity>;

  abstract remove(cabinetId: string, userId: string): Promise<void>;

  abstract findByCabinetId(cabinetId: string): Promise<CabinetMemberEntity[]>;

  abstract findMembership(
    userId: string,
    cabinetId: string,
  ): Promise<CabinetMemberEntity | null>;

  abstract findById(id: string): Promise<CabinetMemberEntity | null>;

  abstract findByUserId(
    userId: string,
    roles?: CabinetRole[],
  ): Promise<CabinetMemberEntity[]>;
}
