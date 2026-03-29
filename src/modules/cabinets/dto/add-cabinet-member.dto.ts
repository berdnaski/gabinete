import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { CabinetRole } from '../domain/cabinet-role.enum';

export class AddCabinetMemberDto {
  @ApiProperty({ example: 'clx5678efgh' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: CabinetRole, example: CabinetRole.STAFF })
  @IsEnum(CabinetRole)
  role: CabinetRole;
}
