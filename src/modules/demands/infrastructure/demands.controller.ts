import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UserEntity, UserRole } from '../../users/domain/user.entity';
import { CreateDemandUseCase } from '../application/create-demand.use-case';
import { AddDemandEvidenceUseCase } from '../application/add-demand-evidence.use-case';
import { CreateDemandDto } from '../dto/create-demand.dto';
import { DemandEntity } from '../domain/demand.entity';

@ApiTags('demands')
@Controller('demands')
export class DemandsController {
  constructor(
    private readonly createDemandUseCase: CreateDemandUseCase,
    private readonly addDemandEvidenceUseCase: AddDemandEvidenceUseCase,
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates a new Demand (Authenticated or Guest Flow) - JSON only',
  })
  @ApiResponse({ status: 201, description: 'Demand successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Validation error (missing guestEmail)',
  })
  async create(
    @Body() dto: CreateDemandDto,
    @CurrentUser() user: UserEntity | null,
  ): Promise<DemandEntity> {
    return this.createDemandUseCase.execute({ dto, userId: user?.id });
  }

  @Post(':id/evidences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add evidences to an existing demand' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('evidences', 5))
  async addEvidences(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity | null,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) files: Express.Multer.File[],
  ): Promise<void> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.addDemandEvidenceUseCase.execute({
      demandId: id,
      userId: user?.id || '',
      userRole: user?.role,
      files,
    });
  }
}
