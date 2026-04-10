import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCabinetDto } from './create-cabinet.dto';

export class UpdateCabinetDto extends PartialType(
  OmitType(CreateCabinetDto, ['avatarUrl'] as const),
) {}
