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
import { ListDemandsByReporterUseCase } from '../application/list-demands-by-reporter.use-case';

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
    private readonly listDemandsByReporterUseCase: ListDemandsByReporterUseCase,
  ) { }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Creates a new Demand (Authenticated or Guest Flow). Accepts optional evidence files in the same request.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'description', 'address', 'neighborhood', 'city', 'state'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
        address: { type: 'string' },
        zipcode: { type: 'string' },
        lat: { type: 'number' },
        long: { type: 'number' },
        neighborhood: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        guestEmail: { type: 'string' },
        cabinetId: { type: 'string' },
        categoryId: { type: 'string' },
        evidences: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional image files attached at creation time',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    type: DemandEntity,
    description: 'Demand successfully created (with evidences if provided)',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @UseInterceptors(FilesInterceptor('evidences', 5))
  async create(
    @Body() dto: CreateDemandDto,
    @CurrentUser() user: UserEntity | null,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MagicBytesValidator({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
          }),
        ],
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ): Promise<DemandEntity> {
    return this.createDemandUseCase.execute(dto, user?.id, files);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List demands with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of demands',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/DemandEntity' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async list(
    @Query() query: ListDemandsDto,
    @CurrentUser() user: UserEntity | null,
  ) {
    return this.listDemandsUseCase.execute(query, user?.id);
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List demands created by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Paginated list of user demands' })
  async listMe(
    @Query() query: ListDemandsDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.listDemandsByReporterUseCase.execute(user.id, query, user.id);
  }

  @Get('neighborhoods')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a list of neighborhoods that have active demands',
  })
  @ApiResponse({
    status: 200,
    description: 'List of unique neighborhoods',
    type: [String],
  })
  async listNeighborhoods(
    @Query('cabinetId') cabinetId?: string,
  ): Promise<string[]> {
    return this.listDemandNeighborhoodsUseCase.execute(cabinetId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a demand by ID' })
  @ApiResponse({ status: 200, type: DemandEntity })
  @ApiResponse({ status: 404, description: 'Demand not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity | null,
  ) {
    return this.findDemandUseCase.execute(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, DemandAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a demand' })
  @ApiResponse({ status: 200, type: DemandEntity })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Demand not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDemandDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.updateDemandUseCase.execute(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, DemandAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a demand' })
  @ApiResponse({ status: 200, description: 'Demand soft-deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Demand not found' })
  async delete(@Param('id') id: string) {
    return this.deleteDemandUseCase.execute(id);
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim a global demand for your cabinet' })
  @ApiResponse({
    status: 201,
    type: DemandEntity,
    description: "Demand claimed for the caller's cabinet",
  })
  @ApiResponse({
    status: 400,
    description: 'Demand is already assigned to a cabinet',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Caller does not belong to any cabinet',
  })
  @ApiResponse({ status: 404, description: 'Demand not found' })
  async claim(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.claimDemandUseCase.execute(id, user.id);
  }

  @Post(':id/evidences')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add evidences to an existing demand' })
  @ApiResponse({ status: 201, description: 'Evidences uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'No files provided or invalid file type/size',
  })
  @ApiResponse({ status: 404, description: 'Demand not found' })
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
  async uploadEvidence(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity | null,
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
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.addDemandEvidenceUseCase.execute(id, user?.id, files);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, DemandAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a demand to a specific cabinet member' })
  @ApiResponse({ status: 200, type: DemandEntity })
  @ApiResponse({
    status: 400,
    description:
      'Demand has no cabinet or assignee is not a member of the cabinet',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: "Caller is not a member of the demand's cabinet",
  })
  @ApiResponse({ status: 404, description: 'Demand not found' })
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
  @ApiResponse({ status: 201, description: 'Comment posted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Demand not found' })
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
  @ApiResponse({
    status: 200,
    description: 'Paginated list of demand comments',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/DemandCommentResponseDto' },
        },
        total: { type: 'number', example: 50 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Demand not found' })
  async listComments(@Param('id') id: string, @Query() query: ListCommentsDto) {
    return this.listDemandCommentsUseCase.execute(id, query);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like status for a demand' })
  @ApiResponse({
    status: 201,
    description: 'Returns true if the demand is now liked, false if unliked',
    schema: { type: 'boolean', example: true },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Demand not found' })
  async toggleLike(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.toggleDemandLikeUseCase.execute(id, user.id);
  }
}
