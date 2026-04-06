import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
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
import { DemandAccessGuard } from '../../../shared/guards/demand-access.guard';
import { UserEntity } from '../../users/domain/user.entity';
import { CreateDemandUseCase } from '../application/create-demand.use-case';
import { AddDemandEvidenceUseCase } from '../application/add-demand-evidence.use-case';
import { ListDemandsUseCase } from '../application/list-demands.use-case';
import { CreateDemandDto } from '../dto/create-demand.dto';
import { ListDemandsDto } from '../dto/list-demands.dto';
import { DemandEntity } from '../domain/demand.entity';
import { MagicBytesValidator } from '../../../shared/validators/magic-bytes.validator';
import { FindDemandUseCase } from '../application/find-demand-use-case';
import { UpdateDemandUseCase } from '../application/update-demand.use-case';
import { DeleteDemandUseCase } from '../application/delete-demand.use-case';
import { ClaimDemandUseCase } from '../application/claim-demand.use-case';
import { UpdateDemandDto } from '../dto/update-demand.dto';

@ApiTags('demands')
@Controller('demands')
export class DemandsController {
  constructor(
    private readonly createDemandUseCase: CreateDemandUseCase,
    private readonly addDemandEvidenceUseCase: AddDemandEvidenceUseCase,
    private readonly listDemandsUseCase: ListDemandsUseCase,
    private readonly findDemandUseCase: FindDemandUseCase,
    private readonly updateDemandUseCase: UpdateDemandUseCase,
    private readonly deleteDemandUseCase: DeleteDemandUseCase,
    private readonly claimDemandUseCase: ClaimDemandUseCase,
  ) { }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates a new Demand (Authenticated or Guest Flow)',
  })
  @ApiResponse({ status: 201, description: 'Demand successfully created' })
  async create(
    @Body() dto: CreateDemandDto,
    @CurrentUser() user: UserEntity | null,
  ): Promise<DemandEntity> {
    return this.createDemandUseCase.execute({ dto, userId: user?.id });
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List demands with filters and pagination' })
  async list(@Query() query: ListDemandsDto) {
    return this.listDemandsUseCase.execute(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a demand by ID' })
  async findById(@Param('id') id: string) {
    return this.findDemandUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, DemandAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a demand' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDemandDto,
  ) {
    return this.updateDemandUseCase.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, DemandAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a demand' })
  async delete(@Param('id') id: string) {
    return this.deleteDemandUseCase.execute(id);
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim a global demand for your cabinet' })
  async claim(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Body('cabinetId') cabinetId?: string,
  ) {
    return this.claimDemandUseCase.execute({
      demandId: id,
      userId: user.id,
      cabinetId,
    });
  }

  @Post(':id/evidences')
  @UseGuards(JwtAuthGuard, DemandAccessGuard)
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
          new MagicBytesValidator({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
          }),
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
