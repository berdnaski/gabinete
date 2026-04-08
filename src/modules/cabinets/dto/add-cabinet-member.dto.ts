import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { CabinetRole } from '../domain/cabinet-role.enum';

export class AddCabinetMemberDto {
  @ApiProperty({ description: 'UUID do usuário a ser adicionado' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: CabinetRole, example: CabinetRole.STAFF })
  @IsEnum(CabinetRole)
  role: CabinetRole;
}
