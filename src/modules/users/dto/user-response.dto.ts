import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../domain/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id: string;

  @ApiProperty({ example: 'Maria Silva' })
  name: string;

  @ApiProperty({ example: 'maria@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MEMBER })
  role: UserRole;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl: string | null;
}
