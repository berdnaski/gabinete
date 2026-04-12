import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CabinetRole } from '../domain/cabinet-role.enum';

export class UpdateCabinetMemberRoleDto {
  @ApiProperty({ enum: CabinetRole, example: CabinetRole.STAFF })
  @IsEnum(CabinetRole)
  @IsNotEmpty()
  role: CabinetRole;
}
