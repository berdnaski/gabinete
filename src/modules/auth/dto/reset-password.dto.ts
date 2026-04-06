import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'cm...token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'nova_senha_123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  password: string;
}
