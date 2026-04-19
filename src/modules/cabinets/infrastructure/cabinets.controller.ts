import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MagicBytesValidator } from '../../../shared/validators/magic-bytes.validator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CabinetRolesGuard } from '../../../shared/guards/cabinet-roles.guard';
import { CabinetRoles } from '../../../shared/decorators/cabinet-roles.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole, UserEntity } from '../../users/domain/user.entity';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { CreateCabinetUseCase } from '../application/create-cabinet.use-case';
import { DeleteCabinetUseCase } from '../application/delete-cabinet.use-case';
import { FindCabinetBySlugUseCase } from '../application/find-cabinet-by-slug.use-case';
import { ListCabinetMembersUseCase } from '../application/list-cabinet-members.use-case';
import { ListCabinetsUseCase } from '../application/list-cabinets.use-case';
import { RemoveCabinetMemberUseCase } from '../application/remove-cabinet-member.use-case';
import { UpdateCabinetUseCase } from '../application/update-cabinet.use-case';
import { CabinetMemberEntity } from '../domain/cabinet-member.entity';
import { CabinetEntity } from '../domain/cabinet.entity';
import { CabinetMemberResponseDto } from '../dto/cabinet-member-response.dto';
import { CabinetResponseDto } from '../dto/cabinet-response.dto';
import { CreateCabinetDto } from '../dto/create-cabinet.dto';
import { UpdateCabinetDto } from '../dto/update-cabinet.dto';
import { InviteCabinetMemberDto } from '../dto/invite-cabinet-member.dto';
import { InviteCabinetMemberUseCase } from '../application/invite-cabinet-member.use-case';
import { GetCabinetInvitationUseCase } from '../application/get-cabinet-invitation.use-case';
import { AcceptCabinetInvitationUseCase } from '../application/accept-cabinet-invitation.use-case';
import { ListCabinetInvitationsUseCase } from '../application/list-cabinet-invitations.use-case';
import { CancelCabinetInvitationUseCase } from '../application/cancel-cabinet-invitation.use-case';
import { UpdateCabinetMemberRoleUseCase } from '../application/update-cabinet-member-role.use-case';
import { LeaveCabinetUseCase } from '../application/leave-cabinet.use-case';
import { GetCurrentUserCabinetsUseCase } from '../application/get-current-user-cabinets.use-case';
import { UpdateCabinetMemberRoleDto } from '../dto/update-cabinet-member-role.dto';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

@ApiTags('cabinets')
@Controller('cabinets')
export class CabinetsController {
  constructor(
    private readonly createCabinetUseCase: CreateCabinetUseCase,
    private readonly listCabinetsUseCase: ListCabinetsUseCase,
    private readonly findCabinetBySlugUseCase: FindCabinetBySlugUseCase,
    private readonly updateCabinetUseCase: UpdateCabinetUseCase,
    private readonly deleteCabinetUseCase: DeleteCabinetUseCase,
    private readonly inviteCabinetMemberUseCase: InviteCabinetMemberUseCase,
    private readonly getCabinetInvitationUseCase: GetCabinetInvitationUseCase,
    private readonly acceptCabinetInvitationUseCase: AcceptCabinetInvitationUseCase,
    private readonly listCabinetInvitationsUseCase: ListCabinetInvitationsUseCase,
    private readonly cancelCabinetInvitationUseCase: CancelCabinetInvitationUseCase,
    private readonly updateCabinetMemberRoleUseCase: UpdateCabinetMemberRoleUseCase,
    private readonly leaveCabinetUseCase: LeaveCabinetUseCase,
    private readonly listCabinetMembersUseCase: ListCabinetMembersUseCase,
    private readonly removeCabinetMemberUseCase: RemoveCabinetMemberUseCase,
    private readonly getCurrentUserCabinetsUseCase: GetCurrentUserCabinetsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new cabinet' })
  @ApiResponse({ status: 201, type: CabinetResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateCabinetDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CabinetResponseDto> {
    const { cabinet } = await this.createCabinetUseCase.execute({
      ...dto,
      ownerUserId: user.id,
    });
    return this.toCabinetDto(cabinet);
  }

  @Get()
  @ApiOperation({ summary: 'List all cabinets with pagination' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/CabinetResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async list(@Query() query: PaginationQueryDto) {
    const result = await this.listCabinetsUseCase.execute(query);
    return {
      items: result.items.map((c) => this.toCabinetDto(c)),
      total: result.total,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List cabinets the current user belongs to' })
  @ApiResponse({
    status: 200,
    type: [CabinetResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listMyCabinets(
    @CurrentUser() user: UserEntity,
  ): Promise<CabinetResponseDto[]> {
    const cabinets = await this.getCurrentUserCabinetsUseCase.execute(user.id);
    return cabinets.map((c) => this.toCabinetDto(c));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get cabinet by slug' })
  @ApiResponse({ status: 200, type: CabinetResponseDto })
  @ApiResponse({ status: 404, description: 'Cabinet not found' })
  async findOne(@Param('slug') slug: string): Promise<CabinetResponseDto> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.toCabinetDto(cabinet);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cabinet by slug' })
  @ApiResponse({ status: 200, type: CabinetResponseDto })
  @ApiResponse({ status: 404, description: 'Cabinet not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        email: { type: 'string' },
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateCabinetDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MagicBytesValidator({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<CabinetResponseDto> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    const updated = await this.updateCabinetUseCase.execute(
      {
        id: cabinet.id,
        ...dto,
      },
      file,
    );
    return this.toCabinetDto(updated);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete cabinet by slug' })
  @ApiResponse({ status: 204, description: 'Cabinet deleted' })
  @ApiResponse({ status: 404, description: 'Cabinet not found' })
  async remove(@Param('slug') slug: string): Promise<void> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    await this.deleteCabinetUseCase.execute(cabinet.id);
  }

  @Post(':slug/invites')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a member to a cabinet by email' })
  @ApiResponse({ status: 201, description: 'Invitation sent or user linked' })
  @ApiResponse({ status: 404, description: 'Cabinet not found' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  async inviteMember(
    @Param('slug') slug: string,
    @Body() dto: InviteCabinetMemberDto,
    @CurrentUser() user: UserEntity,
  ): Promise<{ message: string }> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.inviteCabinetMemberUseCase.execute({
      cabinetId: cabinet.id,
      email: dto.email,
      role: dto.role,
      senderId: user.id,
    });
  }

  @Get('invites/:token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  @ApiResponse({ status: 200, description: 'Invitation details returned' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async getInvite(@Param('token') token: string) {
    return this.getCabinetInvitationUseCase.execute(token);
  }

  @Post('invites/:token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a cabinet invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 403, description: 'Email mismatch' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async acceptInvite(
    @Param('token') token: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.acceptCabinetInvitationUseCase.execute(token, user.id);
  }

  @Get(':slug/invites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending invitations for a cabinet' })
  @ApiResponse({ status: 200, description: 'List of invitations' })
  @ApiResponse({ status: 403, description: 'Only owners can list' })
  async listInvites(
    @Param('slug') slug: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.listCabinetInvitationsUseCase.execute(slug, user.id);
  }

  @Delete('invites/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  @ApiResponse({ status: 200, description: 'Invitation canceled' })
  @ApiResponse({ status: 403, description: 'Only owners can cancel' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async cancelInvite(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.cancelCabinetInvitationUseCase.execute(id, user.id);
  }

  @Patch(':slug/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a cabinet member role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot change own role' })
  @ApiResponse({ status: 403, description: 'Only owners can update roles' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async updateMemberRole(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateCabinetMemberRoleDto,
    @CurrentUser() requester: UserEntity,
  ) {
    return this.updateCabinetMemberRoleUseCase.execute({
      slug,
      targetUserId: userId,
      newRole: dto.role,
      requesterId: requester.id,
    });
  }

  @Post(':slug/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a cabinet voluntarily' })
  @ApiResponse({ status: 200, description: 'Left successfully' })
  @ApiResponse({ status: 400, description: 'Owners cannot leave' })
  @ApiResponse({ status: 404, description: 'Cabinet not found' })
  async leaveCabinet(
    @Param('slug') slug: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.leaveCabinetUseCase.execute(slug, user.id);
  }

  @Get(':slug/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List members of a cabinet' })
  @ApiResponse({ status: 200, type: [CabinetMemberResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cabinet not found' })
  async listMembers(
    @Param('slug') slug: string,
  ): Promise<CabinetMemberResponseDto[]> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    const members = await this.listCabinetMembersUseCase.execute(cabinet.id);
    return members.map((m) => this.toMemberDto(m));
  }

  @Delete(':slug/members/:userId')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from a cabinet' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  async removeMember(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    await this.removeCabinetMemberUseCase.execute(cabinet.id, userId, user.id);
  }

  private toCabinetDto(entity: CabinetEntity): CabinetResponseDto {
    const dto = new CabinetResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.slug = entity.slug;
    dto.description = entity.description;
    dto.avatarUrl = entity.avatarUrl;
    dto.email = entity.email;
    return dto;
  }

  private toMemberDto(entity: CabinetMemberEntity): CabinetMemberResponseDto {
    const dto = new CabinetMemberResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.cabinetId = entity.cabinetId;
    dto.role = entity.role;
    return dto;
  }
}
