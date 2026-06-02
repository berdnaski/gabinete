import {
  Param,
  Patch,
  Body,
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { StorageService } from '../../../shared/domain/services/storage.service';
import { UserRole } from '../../users/domain/user.entity';
import { CreateCabinetWithOwnerUseCase } from '../application/create-cabinet-with-owner.use-case';
import { CreateAdminUserUseCase } from '../application/create-admin-user.use-case';
import { UpdateAdminUserUseCase } from '../application/update-admin-user.use-case';
import { CreateCabinetWithOwnerDto } from '../dto/create-cabinet-with-owner.dto';
import { UpdateAdminCabinetDto } from '../dto/update-admin-cabinet.dto';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { CabinetRole } from '../../cabinets/domain/cabinet-role.enum';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { UpdateCabinetUseCase } from '../../cabinets/application/update-cabinet.use-case';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dto/update-admin-user.dto';
import { ListReportedDemandsUseCase } from '../../demands/application/list-reported-demands.use-case';
import { ListDemandReportReasonsUseCase } from '../../demands/application/list-demand-report-reasons.use-case';
import { DismissDemandReportsUseCase } from '../../demands/application/dismiss-demand-reports.use-case';
import { DeleteDemandUseCase } from '../../demands/application/delete-demand.use-case';
import { DisableUserUseCase } from '../application/disable-user.use-case';
import { EnableUserUseCase } from '../application/enable-user.use-case';
import { ListReportedDemandsDto } from '../dto/list-reported-demands.dto';
import { ListReportReasonsDto } from '../dto/list-report-reasons.dto';
import { ReportedDemandResponseDto } from '../dto/reported-demand-response.dto';

@ApiTags('admin')
@ApiExtraModels(ReportedDemandResponseDto)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly createCabinetWithOwnerUseCase: CreateCabinetWithOwnerUseCase,
    private readonly createAdminUserUseCase: CreateAdminUserUseCase,
    private readonly updateAdminUserUseCase: UpdateAdminUserUseCase,
    private readonly storageService: StorageService,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly updateCabinetUseCase: UpdateCabinetUseCase,
    private readonly listReportedDemandsUseCase: ListReportedDemandsUseCase,
    private readonly listDemandReportReasonsUseCase: ListDemandReportReasonsUseCase,
    private readonly dismissDemandReportsUseCase: DismissDemandReportsUseCase,
    private readonly deleteDemandUseCase: DeleteDemandUseCase,
    private readonly disableUserUseCase: DisableUserUseCase,
    private readonly enableUserUseCase: EnableUserUseCase,
  ) {}

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'List reported demands grouped by demand, ordered by reports count desc and first report date asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reported demands',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(ReportedDemandResponseDto) },
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
  async listReports(@Query() query: ListReportedDemandsDto) {
    return this.listReportedDemandsUseCase.execute({
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('reports/:demandId/reasons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'demandId', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'List individual report reasons for a demand' })
  @HttpCode(HttpStatus.OK)
  async listReportReasons(
    @Param('demandId') demandId: string,
    @Query() query: ListReportReasonsDto,
  ) {
    return this.listDemandReportReasonsUseCase.execute(demandId, {
      page: query.page,
      limit: query.limit,
    });
  }

  @Patch('reports/:demandId/dismiss')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'demandId', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Dismiss all reports for a demand and prevent new ones' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async dismissReports(@Param('demandId') demandId: string): Promise<void> {
    await this.dismissDemandReportsUseCase.execute(demandId);
  }

  @Delete('demands/:demandId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'demandId', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Soft delete a demand (Admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDemand(@Param('demandId') demandId: string): Promise<void> {
    await this.deleteDemandUseCase.execute(demandId);
  }

  @Patch('users/:userId/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Disable a user account (Admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableUser(@Param('userId') userId: string): Promise<void> {
    await this.disableUserUseCase.execute(userId);
  }

  @Patch('users/:userId/enable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Re-enable a disabled user account (Admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async enableUser(@Param('userId') userId: string): Promise<void> {
    await this.enableUserUseCase.execute(userId);
  }

  @Post('cabinets/avatar/presign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a presigned URL for direct cabinet avatar upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', example: 'avatar.png' },
        mimetype: { type: 'string', example: 'image/png' },
      },
      required: ['filename', 'mimetype'],
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        uploadUrl: { type: 'string', example: 'https://...' },
        storageKey: { type: 'string', example: 'cabinets/avatars/uuid.png' },
        avatarUrl: { type: 'string', example: 'https://cdn.example.com/cabinets/avatars/uuid.png' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async presignCabinetAvatarUpload(
    @Body() body: { filename: string; mimetype: string },
  ): Promise<{ uploadUrl: string; storageKey: string; avatarUrl: string }> {
    const allowed = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
    if (!body?.filename?.trim() || !body?.mimetype?.trim()) {
      throw new BadRequestException('filename e mimetype são obrigatórios');
    }
    if (!allowed.has(body.mimetype)) {
      throw new BadRequestException('Tipo de arquivo inválido');
    }

    const ext = body.filename.split('.').pop() ?? 'png';
    const storageKey = `cabinets/avatars/${uuidv4()}.${ext}`;

    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      storageKey,
      body.mimetype,
      600,
    );
    const { signedUrl } = await this.storageService.getUrl(storageKey);

    return { uploadUrl, storageKey, avatarUrl: signedUrl };
  }

  @Post('cabinets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a cabinet for an existing owner user (MEMBER)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ownerUserId: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        description: { type: 'string' },
        avatarUrl: { type: 'string' },
      },
      required: ['ownerUserId', 'name'],
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        cabinet: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            email: { type: 'string', nullable: true },
            description: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
          },
        },
        ownerUser: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            phone: { type: 'string', nullable: true },
          },
        },
        ownerMember: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createCabinetWithOwner(
    @Body() dto: CreateCabinetWithOwnerDto,
  ) {
    return this.createCabinetWithOwnerUseCase.execute({
      ownerUserId: dto.ownerUserId,
      name: dto.name,
      email: dto.email,
      description: dto.description,
      avatarUrl: dto.avatarUrl,
    });
  }

  @Patch('cabinets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Update a cabinet (Admin)' })
  @HttpCode(HttpStatus.OK)
  async updateCabinet(
    @Param('id') id: string,
    @Body() dto: UpdateAdminCabinetDto,
  ) {
    const existing = await this.cabinetsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    if (dto.ownerUserId) {
      const ownerUser = await this.usersRepository.findById(dto.ownerUserId);
      if (!ownerUser || ownerUser.role !== UserRole.MEMBER) {
        throw new BadRequestException('Usuário responsável não encontrado.');
      }

      const members = await this.cabinetMembersRepository.findByCabinetId(id);
      const currentOwner = members.find((m) => m.role === CabinetRole.OWNER) ?? null;
      const newOwnerMember = members.find((m) => m.userId === dto.ownerUserId) ?? null;

      if (newOwnerMember) {
        await this.cabinetMembersRepository.updateRole(
          dto.ownerUserId,
          id,
          CabinetRole.OWNER,
        );
      } else {
        await this.cabinetMembersRepository.add({
          userId: dto.ownerUserId,
          cabinetId: id,
          role: CabinetRole.OWNER,
        });
      }

      if (currentOwner && currentOwner.userId !== dto.ownerUserId) {
        await this.cabinetMembersRepository.updateRole(
          currentOwner.userId,
          id,
          CabinetRole.STAFF,
        );
      }
    }

    const updatedCabinet = await this.updateCabinetUseCase.execute(
      {
        id,
        name: dto.name,
        email: dto.email,
        description: dto.description,
        avatarUrl: dto.avatarUrl,
      },
      undefined,
    );

    const members = await this.cabinetMembersRepository.findByCabinetId(id);
    const ownerMember = members.find((m) => m.role === CabinetRole.OWNER) ?? null;
    const ownerUser = ownerMember
      ? await this.usersRepository.findById(ownerMember.userId)
      : null;

    return {
      cabinet: updatedCabinet,
      ownerUser: ownerUser
        ? {
            id: ownerUser.id,
            name: ownerUser.name,
            email: ownerUser.email,
            role: ownerUser.role,
            phone: ownerUser.phone,
          }
        : null,
      ownerMember,
    };
  }

  @Get('cabinets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Get cabinet details (Admin)' })
  @HttpCode(HttpStatus.OK)
  async getCabinetDetails(@Param('id') id: string) {
    const cabinet = await this.cabinetsRepository.findById(id);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const members = await this.cabinetMembersRepository.findByCabinetId(id);
    const ownerMember = members.find((m) => m.role === CabinetRole.OWNER) ?? null;
    const ownerUser = ownerMember
      ? await this.usersRepository.findById(ownerMember.userId)
      : null;

    return {
      cabinet,
      ownerUser: ownerUser
        ? {
            id: ownerUser.id,
            name: ownerUser.name,
            email: ownerUser.email,
            role: ownerUser.role,
            phone: ownerUser.phone,
          }
        : null,
      ownerMember,
    };
  }

  @Delete('cabinets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Soft delete a cabinet (Admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCabinet(@Param('id') id: string): Promise<void> {
    const existing = await this.cabinetsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Gabinete não encontrado');
    }
    await this.cabinetsRepository.softDelete(id);
  }

  @Post('users/avatar/presign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a presigned URL for direct user avatar upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', example: 'avatar.png' },
        mimetype: { type: 'string', example: 'image/png' },
      },
      required: ['filename', 'mimetype'],
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        uploadUrl: { type: 'string', example: 'https://...' },
        storageKey: { type: 'string', example: 'users/avatars/uuid.png' },
        avatarUrl: { type: 'string', example: 'https://cdn.example.com/users/avatars/uuid.png' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async presignUserAvatarUpload(
    @Body() body: { filename: string; mimetype: string },
  ): Promise<{ uploadUrl: string; storageKey: string; avatarUrl: string }> {
    const allowed = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
    if (!body?.filename?.trim() || !body?.mimetype?.trim()) {
      throw new BadRequestException('filename e mimetype são obrigatórios');
    }
    if (!allowed.has(body.mimetype)) {
      throw new BadRequestException('Tipo de arquivo inválido');
    }

    const ext = body.filename.split('.').pop() ?? 'png';
    const storageKey = `users/avatars/${uuidv4()}.${ext}`;

    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      storageKey,
      body.mimetype,
      600,
    );
    const { signedUrl } = await this.storageService.getUrl(storageKey);

    return { uploadUrl, storageKey, avatarUrl: signedUrl };
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a user with a chosen role (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateAdminUserDto) {
    return this.createAdminUserUseCase.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      avatarUrl: dto.avatarUrl,
    });
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Get user details (Admin)' })
  @HttpCode(HttpStatus.OK)
  async getUserDetails(@Param('id') id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Update a user (Admin)' })
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.updateAdminUserUseCase.execute({
      id,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      avatarUrl: dto.avatarUrl,
    });
  }
}
