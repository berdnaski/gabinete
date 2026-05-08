import {
  Body,
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { StorageService } from '../../../shared/domain/services/storage.service';
import { UserRole } from '../../users/domain/user.entity';
import { CreateCabinetWithOwnerUseCase } from '../application/create-cabinet-with-owner.use-case';
import { CreateCabinetWithOwnerDto } from '../dto/create-cabinet-with-owner.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly createCabinetWithOwnerUseCase: CreateCabinetWithOwnerUseCase,
    private readonly storageService: StorageService,
  ) {}

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
}
