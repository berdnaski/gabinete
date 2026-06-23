import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
import { ListCabinetsDto } from '../dto/list-cabinets.dto';
import { GetCabinetPlanUseCase } from '../../plans/application/get-cabinet-plan.use-case';
import { IPlansRepository } from '../../plans/domain/plans.repository.interface';
import { ConfigService } from '@nestjs/config';
import { CabinetSectionsRepository } from './cabinet-sections.repository';
import { UpsertCabinetSectionsUseCase } from '../application/upsert-cabinet-sections.use-case';
import { UpsertCabinetSectionsDto } from '../dto/upsert-cabinet-sections.dto';
import { GetCabinetTestimonialsUseCase } from '../application/get-cabinet-testimonials.use-case';
import { ToggleTestimonialVisibilityUseCase } from '../application/toggle-testimonial-visibility.use-case';
import { Put } from '@nestjs/common';

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
    private readonly getCabinetPlanUseCase: GetCabinetPlanUseCase,
    private readonly plansRepository: IPlansRepository,
    private readonly configService: ConfigService,
    private readonly cabinetSectionsRepository: CabinetSectionsRepository,
    private readonly upsertCabinetSectionsUseCase: UpsertCabinetSectionsUseCase,
    private readonly getCabinetTestimonialsUseCase: GetCabinetTestimonialsUseCase,
    private readonly toggleTestimonialVisibilityUseCase: ToggleTestimonialVisibilityUseCase,
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
  async list(@Query() query: ListCabinetsDto) {
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

  @Get(':slug/plans')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active plan and feature entitlements for a cabinet' })
  @ApiResponse({ status: 200, description: 'Plan entitlements returned' })
  async getPlans(@Param('slug') slug: string) {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.getCabinetPlanUseCase.execute(cabinet.id);
  }

  @Get(':slug/usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current resource usage counts for a cabinet (members, demands)' })
  @ApiResponse({ status: 200, description: 'Usage counts returned' })
  async getUsage(@Param('slug') slug: string) {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.plansRepository.getCabinetUsage(cabinet.id);
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
        accentColor: { type: 'string', example: '#0058F3' },
        tagline: { type: 'string', example: 'Mandato do povo, para o povo' },
        postDemandMessage: { type: 'string' },
        instagramUrl: { type: 'string' },
        facebookUrl: { type: 'string' },
        websiteUrl: { type: 'string' },
        twitterUrl: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
        banner: { type: 'string', format: 'binary' },
        logo: { type: 'string', format: 'binary', description: 'Cabinet white-label logo' },
        biographyPhoto: { type: 'string', format: 'binary', description: 'Biography photo' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
      { name: 'biographyPhoto', maxCount: 1 },
    ]),
  )
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateCabinetDto,
    @UploadedFiles()
    files?: { avatar?: Express.Multer.File[]; banner?: Express.Multer.File[]; logo?: Express.Multer.File[]; biographyPhoto?: Express.Multer.File[] },
  ): Promise<CabinetResponseDto> {
    const avatarFile = files?.avatar?.[0];
    const bannerFile = files?.banner?.[0];
    const logoFile = files?.logo?.[0];
    const biographyPhotoFile = files?.biographyPhoto?.[0];

    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5_000_000;

    for (const [label, file] of [['avatar', avatarFile], ['banner', bannerFile], ['logo', logoFile], ['biographyPhoto', biographyPhotoFile]] as [string, Express.Multer.File | undefined][]) {
      if (!file) continue;
      if (file.size > maxSize) {
        throw new BadRequestException(`${label}: arquivo excede 5 MB`);
      }
      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException(`${label}: formato não permitido (use PNG, JPG ou WebP)`);
      }
    }

    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    const updated = await this.updateCabinetUseCase.execute(
      { id: cabinet.id, ...dto },
      avatarFile,
      bannerFile,
      logoFile,
      biographyPhotoFile,
    );
    return this.toCabinetDto(updated);
  }

  @Get(':slug/widget.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Embeddable widget script for a cabinet' })
  @ApiResponse({ status: 200, description: 'Returns a JavaScript embed snippet' })
  async getWidget(@Param('slug') slug: string): Promise<string> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    const accent = cabinet.accentColor ?? '#0058F3';
    const name = cabinet.name.replace(/'/g, "\\'");
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://gabineteapp.com.br',
    );
    const profileUrl = `${frontendUrl.replace(/\/$/, '')}/${cabinet.slug}`;

    return `(function(){
  if(document.getElementById('gd-widget-${cabinet.slug}'))return;
  var accent='${accent}';
  var name='${name}';
  var url='${profileUrl}';
  var btn=document.createElement('button');
  btn.id='gd-widget-${cabinet.slug}';
  btn.textContent='Enviar Demanda';
  btn.title='Enviar demanda para '+name;
  btn.setAttribute('aria-label','Enviar demanda para '+name);
  btn.style.cssText='position:fixed;bottom:24px;right:24px;z-index:99999;background:'+accent+';color:#fff;border:none;border-radius:9999px;padding:12px 22px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.18);font-family:system-ui,sans-serif;transition:opacity .2s,transform .2s;';
  btn.onmouseenter=function(){btn.style.opacity='0.88';btn.style.transform='scale(1.04)';};
  btn.onmouseleave=function(){btn.style.opacity='1';btn.style.transform='scale(1)';};
  btn.onclick=function(){window.open(url+'?nova-demanda=1','_blank','noopener,noreferrer');};
  document.body.appendChild(btn);
})();`;
  }

  @Get(':slug/sections')
  @ApiOperation({ summary: 'Get landing page sections for a cabinet' })
  @ApiResponse({ status: 200, description: 'List of enabled sections' })
  async getSections(@Param('slug') slug: string) {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.cabinetSectionsRepository.findEnabledByCabinetId(cabinet.id);
  }

  @Get(':slug/testimonials')
  @ApiOperation({ summary: 'Get visible testimonials for a cabinet (public)' })
  @ApiResponse({ status: 200, description: 'List of testimonials' })
  async getTestimonials(@Param('slug') slug: string) {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.getCabinetTestimonialsUseCase.execute(cabinet.id);
  }

  @Get(':slug/testimonials/all')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER, CabinetRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all testimonials (incl. hidden) for cabinet owner' })
  async getAllTestimonials(@Param('slug') slug: string) {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.getCabinetTestimonialsUseCase.executeAll(cabinet.id);
  }

  @Patch(':slug/testimonials/:demandId/hide')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER, CabinetRole.STAFF)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hide a testimonial from public page' })
  async hideTestimonial(
    @Param('slug') slug: string,
    @Param('demandId') demandId: string,
  ): Promise<void> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    await this.toggleTestimonialVisibilityUseCase.execute(demandId, cabinet.id, true);
  }

  @Patch(':slug/testimonials/:demandId/show')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER, CabinetRole.STAFF)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Show a previously hidden testimonial' })
  async showTestimonial(
    @Param('slug') slug: string,
    @Param('demandId') demandId: string,
  ): Promise<void> {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    await this.toggleTestimonialVisibilityUseCase.execute(demandId, cabinet.id, false);
  }

  @Put(':slug/sections')
  @UseGuards(JwtAuthGuard, CabinetRolesGuard)
  @CabinetRoles(CabinetRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update all landing page sections (bulk upsert)' })
  async upsertSections(
    @Param('slug') slug: string,
    @Body() body: UpsertCabinetSectionsDto,
  ) {
    const cabinet = await this.findCabinetBySlugUseCase.execute(slug);
    return this.upsertCabinetSectionsUseCase.execute(cabinet.id, body.sections);
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
  @ApiOperation({ summary: 'List members of a cabinet' })
  @ApiResponse({ status: 200, type: [CabinetMemberResponseDto] })
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
    dto.bannerUrl = entity.bannerUrl ?? null;
    dto.logoUrl = entity.logoUrl ?? null;
    dto.accentColor = entity.accentColor ?? null;
    dto.tagline = entity.tagline ?? null;
    dto.postDemandMessage = entity.postDemandMessage ?? null;
    dto.instagramUrl = entity.instagramUrl ?? null;
    dto.facebookUrl = entity.facebookUrl ?? null;
    dto.websiteUrl = entity.websiteUrl ?? null;
    dto.twitterUrl = entity.twitterUrl ?? null;
    dto.email = entity.email;
    dto.heroTitle = entity.heroTitle ?? null;
    dto.heroSubtitle = entity.heroSubtitle ?? null;
    dto.heroVideoUrl = entity.heroVideoUrl ?? null;
    dto.biographyContent = entity.biographyContent ?? null;
    dto.biographyPhotoUrl = entity.biographyPhotoUrl ?? null;
    dto.whatsappUrl = entity.whatsappUrl ?? null;
    dto.youtubeUrl = entity.youtubeUrl ?? null;
    dto.tiktokUrl = entity.tiktokUrl ?? null;
    dto.score = entity.score ?? 0;
    dto.demand_count = entity.demand_count ?? 0;
    dto.in_progress_count = entity.in_progress_count ?? 0;
    dto.resolved_count = entity.resolved_count ?? 0;
    dto.transparencyScore = entity.resolution_rate ?? 0;
    dto.resolution_rate = entity.resolution_rate ?? 0;
    dto.disabledAt = entity.disabledAt ?? null;
    return dto;
  }

  private toMemberDto(entity: CabinetMemberEntity): CabinetMemberResponseDto {
    const dto = new CabinetMemberResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.cabinetId = entity.cabinetId;
    dto.role = entity.role;
    dto.userName = entity.userName ?? '';
    dto.userAvatarUrl = entity.userAvatarUrl ?? null;
    dto.userEmail = entity.userEmail ?? null;
    return dto;
  }
}
