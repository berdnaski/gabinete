import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CabinetSectionType } from '@prisma/client';

export class UpsertSectionItemDto {
  @ApiProperty({ enum: CabinetSectionType })
  @IsEnum(CabinetSectionType)
  type: CabinetSectionType;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpsertCabinetSectionsDto {
  @ApiProperty({ type: [UpsertSectionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSectionItemDto)
  sections: UpsertSectionItemDto[];
}
