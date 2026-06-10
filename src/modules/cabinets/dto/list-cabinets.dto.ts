import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class ListCabinetsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, slug, email or description' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter cabinets that have at least one demand (disabledAt=null)',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  hasDemands?: boolean;

  @ApiPropertyOptional({
    description: 'true = inactive only, false = active only, omit = all',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  @IsOptional()
  showInactive?: boolean;
}
