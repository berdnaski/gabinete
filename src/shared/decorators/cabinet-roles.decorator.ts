import { SetMetadata } from '@nestjs/common';
import { CabinetRole } from '../../modules/cabinets/domain/cabinet-role.enum';

export const CABINET_ROLES_KEY = 'cabinetRoles';
export const CabinetRoles = (...roles: CabinetRole[]) => SetMetadata(CABINET_ROLES_KEY, roles);
