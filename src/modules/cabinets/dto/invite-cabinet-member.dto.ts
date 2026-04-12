import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { CabinetRole } from '../domain/cabinet-role.enum';

export class InviteCabinetMemberDto {
  @ApiProperty({ example: 'colaborador@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: CabinetRole, example: CabinetRole.STAFF })
  @IsEnum(CabinetRole)
  role: CabinetRole;
}
