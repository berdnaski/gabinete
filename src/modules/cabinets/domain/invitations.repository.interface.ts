import { CabinetRole } from './cabinet-role.enum';

export interface CreateInvitationInput {
  email: string;
  cabinetId: string;
  role: CabinetRole;
  token: string;
  expiresAt: Date;
}

export abstract class ICabinetInvitationsRepository {
  abstract create(data: CreateInvitationInput): Promise<void>;
  abstract findByEmail(email: string): Promise<any[]>;
  abstract findByToken(token: string): Promise<any | null>;
  abstract delete(id: string): Promise<void>;
  abstract deleteManyByEmail(email: string): Promise<void>;
}
