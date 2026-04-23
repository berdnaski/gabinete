import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignDemandDto {
  @ApiProperty({
    description:
      'Cabinet member ID to assign the demand to. Can be null to clear.',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  assigneeMemberId: string | null;
}
