import { ApiProperty } from '@nestjs/swagger';
import { CabinetRole } from '../domain/cabinet-role.enum';

export class CabinetMemberResponseDto {
  @ApiProperty({ example: 'clxmember123' })
  id: string;

  @ApiProperty({ example: 'clx5678efgh' })
  userId: string;

  @ApiProperty({ example: 'clx1234abcd' })
  cabinetId: string;

  @ApiProperty({ enum: CabinetRole, example: CabinetRole.STAFF })
  role: CabinetRole;
}
