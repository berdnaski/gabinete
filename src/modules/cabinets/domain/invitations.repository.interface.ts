import { CabinetRole } from './cabinet-role.enum';
import { CabinetInvitationEntity } from './cabinet-invitation.entity';

export interface CreateInvitationInput {
  email: string;
  cabinetId: string;
  role: CabinetRole;
  token: string;
  expiresAt: Date;
}

export abstract class ICabinetInvitationsRepository {
  abstract create(data: CreateInvitationInput): Promise<void>;
  abstract findByEmail(email: string): Promise<CabinetInvitationEntity[]>;
  abstract findByToken(token: string): Promise<CabinetInvitationEntity | null>;
  abstract findById(id: string): Promise<CabinetInvitationEntity | null>;
  abstract findByCabinetId(
    cabinetId: string,
  ): Promise<CabinetInvitationEntity[]>;
  abstract delete(id: string): Promise<void>;
  abstract deleteManyByEmail(email: string): Promise<void>;
}
