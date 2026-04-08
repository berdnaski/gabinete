import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignDemandDto {
  @ApiProperty({ description: 'Cabinet member ID to assign the demand to' })
  @IsUUID()
  assigneeMemberId: string;
}
