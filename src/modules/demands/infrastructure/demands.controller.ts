import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { DemandAccessGuard } from '../../../shared/guards/demand-access.guard';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt-auth.guard';
import { MagicBytesValidator } from '../../../shared/validators/magic-bytes.validator';
import { UserEntity } from '../../users/domain/user.entity';
import { AddDemandEvidenceUseCase } from '../application/add-demand-evidence.use-case';
import { AssignDemandUseCase } from '../application/assign-demand.use-case';
import { ClaimDemandUseCase } from '../application/claim-demand.use-case';
import { CreateDemandCommentUseCase } from '../application/create-demand-comment.use-case';
import { CreateDemandUseCase } from '../application/create-demand.use-case';
import { DeleteDemandUseCase } from '../application/delete-demand.use-case';
import { FindDemandUseCase } from '../application/find-demand.use-case';
import { GetCabinetDemandMetricsUseCase } from '../application/get-cabinet-demand-metrics.use-case';
import { GetCabinetDemandHeatmapUseCase } from '../application/get-cabinet-demand-heatmap.use-case';
import { DemandEntity } from '../domain/demand.entity';
import { AssignDemandDto } from '../dto/assign-demand.dto';
import { CreateDemandCommentDto } from '../dto/create-demand-comment.dto';
import { CreateDemandDto } from '../dto/create-demand.dto';
import { GetCabinetDemandMetricsResponseDto } from '../dto/get-cabinet-demand-metrics-response.dto';
import { GetCabinetDemandHeatmapResponseDto } from '../dto/get-cabinet-demand-heatmap-response.dto';
import { ListCommentsDto } from '../dto/list-comments.dto';
import { ListDemandsDto } from '../dto/list-demands.dto';
import { UpdateDemandDto } from '../dto/update-demand.dto';
import { ListDemandsUseCase } from '../application/list-demands.use-case';
import { UpdateDemandUseCase } from '../application/update-demand.use-case';
import { ListDemandCommentsUseCase } from '../application/list-demand-comments.use-case';
import { ToggleDemandLikeUseCase } from '../application/toggle-demand-like.use-case';
import { ListDemandNeighborhoodsUseCase } from '../application/list-demand-neighborhoods.use-case';

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
    private readonly assignDemandUseCase: AssignDemandUseCase,
    private readonly createDemandCommentUseCase: CreateDemandCommentUseCase,
    private readonly listDemandCommentsUseCase: ListDemandCommentsUseCase,
    private readonly toggleDemandLikeUseCase: ToggleDemandLikeUseCase,
    private readonly getCabinetDemandMetricsUseCase: GetCabinetDemandMetricsUseCase,
    private readonly getCabinetDemandHeatmapUseCase: GetCabinetDemandHeatmapUseCase,
    private readonly listDemandNeighborhoodsUseCase: ListDemandNeighborhoodsUseCase,
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
    return this.createDemandUseCase.execute(dto, user?.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List demands with filters and pagination' })
  async list(@Query() query: ListDemandsDto) {
    return this.listDemandsUseCase.execute(query);
  }

  @Get('cabinet/:slug/metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get demand metrics for a cabinet by slug' })
  @ApiResponse({ status: 200, type: GetCabinetDemandMetricsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Cabinet not found' })
  async getCabinetMetrics(
    @Param('slug') slug: string,
    @CurrentUser() user: UserEntity,
  ): Promise<GetCabinetDemandMetricsResponseDto> {
    return this.getCabinetDemandMetricsUseCase.execute({
      cabinetSlug: slug,
      userId: user.id,
    });
  }

  @Get('heatmap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get global demand heatmap data' })
  @ApiResponse({ status: 200, type: GetCabinetDemandHeatmapResponseDto })
  async getHeatmap(): Promise<GetCabinetDemandHeatmapResponseDto> {
    return this.getCabinetDemandHeatmapUseCase.execute();
  }

  @Get('neighborhoods')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of neighborhoods that have active demands' })
  @ApiResponse({ status: 200, description: 'List of unique neighborhoods', type: [String] })
  async listNeighborhoods(
    @Query('cabinetId') cabinetId?: string,
  ): Promise<string[]> {
    return this.listDemandNeighborhoodsUseCase.execute(cabinetId);
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
  async update(@Param('id') id: string, @Body() dto: UpdateDemandDto) {
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
  async claim(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.claimDemandUseCase.execute(id, user.id);
  }

  @Post(':id/evidences')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add evidences to an existing demand' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        evidences: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('evidences', 5))
  async addEvidences(
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MagicBytesValidator({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<void> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.addDemandEvidenceUseCase.execute(id, files);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, DemandAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a demand to a specific cabinet member' })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignDemandDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.assignDemandUseCase.execute(id, dto.assigneeMemberId, user.id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a comment on a demand' })
  async addComment(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateDemandCommentDto,
  ) {
    return this.createDemandCommentUseCase.execute(id, user.id, dto.content);
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List comments for a demand' })
  async listComments(@Param('id') id: string, @Query() query: ListCommentsDto) {
    return this.listDemandCommentsUseCase.execute(id, query);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like status for a demand' })
  async toggleLike(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.toggleDemandLikeUseCase.execute(id, user.id);
  }
}
