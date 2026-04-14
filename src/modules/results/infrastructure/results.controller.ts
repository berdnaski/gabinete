import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { ResultAccessGuard } from '../../../shared/guards/result-access.guard';
import { UserEntity } from '../../users/domain/user.entity';
import { AddResultImagesUseCase } from '../application/add-result-images.use-case';
import { CreateResultUseCase } from '../application/create-result.use-case';
import { DeleteResultUseCase } from '../application/delete-result.use-case';
import { FindResultUseCase } from '../application/find-result.use-case';
import { ListResultsUseCase } from '../application/list-results.use-case';
import { UpdateResultUseCase } from '../application/update-result.use-case';
import { UploadResultProtocolUseCase } from '../application/upload-result-protocol.use-case';
import { CreateResultDto } from '../dto/create-result.dto';
import { ListResultsDto } from '../dto/list-results.dto';
import { UpdateResultDto } from '../dto/update-result.dto';
import { ResultEntity } from '../domain/result.entity';

@ApiTags('results')
@Controller('results')
export class ResultsController {
  constructor(
    private readonly createResultUseCase: CreateResultUseCase,
    private readonly listResultsUseCase: ListResultsUseCase,
    private readonly findResultUseCase: FindResultUseCase,
    private readonly updateResultUseCase: UpdateResultUseCase,
    private readonly deleteResultUseCase: DeleteResultUseCase,
    private readonly addResultImagesUseCase: AddResultImagesUseCase,
    private readonly uploadResultProtocolUseCase: UploadResultProtocolUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cria resultado com imagens e protocolo opcionais' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'description', 'type', 'cabinetSlug'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: ['INFRASTRUCTURE', 'SOCIAL', 'LEGISLATIVE', 'OTHER'] },
        cabinetSlug: { type: 'string', description: 'Slug do seu gabinete' },
        demandId: { type: 'string', format: 'uuid' },
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
        protocol: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: ResultEntity })
  @ApiResponse({ status: 400, description: 'Validação inválida' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'protocol', maxCount: 1 },
    ]),
  )
  async create(
    @Body() dto: CreateResultDto,
    @CurrentUser() user: UserEntity,
    @UploadedFiles() files: { images?: Express.Multer.File[]; protocol?: Express.Multer.File[] },
  ): Promise<ResultEntity> {
    if (!files) files = {};
    return this.createResultUseCase.execute(dto, user.id, files.images ?? [], files.protocol?.[0]);
  }

  @Get()
  @ApiOperation({ summary: 'Lista resultados públicos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista paginada de resultados' })
  async list(@Query() query: ListResultsDto) {
    return this.listResultsUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca resultado público por ID' })
  @ApiResponse({ status: 200, type: ResultEntity })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async findById(@Param('id') id: string) {
    return this.findResultUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ResultAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza resultado' })
  @ApiResponse({ status: 200, type: ResultEntity })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(@Param('id') id: string, @Body() dto: UpdateResultDto): Promise<ResultEntity> {
    return this.updateResultUseCase.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ResultAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove resultado' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteResultUseCase.execute(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, ResultAccessGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Adiciona imagens a resultado' })
  @ApiResponse({ status: 201 })
  @UseInterceptors(FilesInterceptor('images', 10))
  async addImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<void> {
    if (!files?.length) throw new BadRequestException('Nenhum arquivo enviado');
    return this.addResultImagesUseCase.execute(id, files);
  }

  @Post(':id/protocol')
  @UseGuards(JwtAuthGuard, ResultAccessGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload do arquivo de protocolo' })
  @ApiResponse({ status: 201, type: ResultEntity })
  @UseInterceptors(FileInterceptor('protocol'))
  async uploadProtocol(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResultEntity> {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    return this.uploadResultProtocolUseCase.execute(id, file);
  }
}
