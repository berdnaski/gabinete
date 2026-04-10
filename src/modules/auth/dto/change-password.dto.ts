import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'SenhaForteAtual123', required: false })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ example: 'NovaSenhaSegura456!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres' })
  newPassword: string;
}
