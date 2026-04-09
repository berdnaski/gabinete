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

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ required: false, nullable: true })
  address: string | null;

  @ApiProperty({ required: false, nullable: true })
  zipcode: string | null;

  @ApiProperty({ required: false, nullable: true })
  neighborhood: string | null;

  @ApiProperty({ required: false, nullable: true })
  city: string | null;

  @ApiProperty({ required: false, nullable: true })
  state: string | null;

  @ApiProperty({ required: false, nullable: true, type: Number })
  lat: number | null;

  @ApiProperty({ required: false, nullable: true, type: Number })
  long: number | null;
}
