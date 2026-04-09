import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '1bef0b78-a10a-48d9-af3a-8debcb0867e9' })
  @IsUUID()
  @IsNotEmpty({ message: 'Token is required' })
  @MaxLength(254)
  token: string;
}
