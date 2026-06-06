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
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard'
import { RolesGuard } from '../../../shared/guards/roles.guard'
import { Roles } from '../../../shared/decorators/roles.decorator'
import { UserRole } from '../../users/domain/user.entity'
import { IPlansRepository } from '../domain/plans.repository.interface'
import { OverrideType } from '../domain/plans.types'

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class PlansAdminController {
  constructor(private readonly repo: IPlansRepository) {}

  @Get('plans')
  @ApiOperation({ summary: 'List all plans with their features' })
  async listPlans() {
    return this.repo.listPlans()
  }

  @Get('plans/subscriptions-summary')
  @ApiOperation({ summary: 'Summarize active subscription per cabinet (cabinetId → plan info)' })
  async listCabinetSubscriptionsSummary() {
    return this.repo.listCabinetSubscriptionsSummary()
  }

  @Get('features')
  @ApiOperation({ summary: 'List all available features' })
  async listFeatures() {
    return this.repo.listFeatures()
  }

  @Post('plans/:planId/features')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'planId', type: 'string' })
  @ApiOperation({ summary: 'Add a feature to a plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featureSlug: { type: 'string' },
        retroactive: { type: 'boolean', description: 'true = effectiveFrom null (retroactive); false = now' },
      },
      required: ['featureSlug'],
    },
  })
  @ApiResponse({ status: 204, description: 'Feature added to plan' })
  async addFeatureToPlan(
    @Param('planId') planId: string,
    @Body() body: { featureSlug: string; retroactive?: boolean },
  ) {
    const effectiveFrom = body.retroactive === false ? new Date() : null
    await this.repo.addFeatureToPlan(planId, body.featureSlug, effectiveFrom)
  }

  @Patch('plans/:planId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'planId', type: 'string' })
  @ApiOperation({ summary: 'Update plan details (name, price, limits)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        priceInCents: { type: 'number' },
        maxMembers: { type: 'number', nullable: true },
        maxDemands: { type: 'number', nullable: true },
        maxStorageGb: { type: 'number', nullable: true },
      },
    },
  })
  async updatePlan(
    @Param('planId') planId: string,
    @Body() body: { name?: string; priceInCents?: number; maxMembers?: number | null; maxDemands?: number | null; maxStorageGb?: number | null },
  ) {
    await this.repo.updatePlan(planId, body)
  }

  @Patch('plans/:planId/active')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'planId', type: 'string' })
  @ApiOperation({ summary: 'Toggle plan active status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { isActive: { type: 'boolean' } },
      required: ['isActive'],
    },
  })
  async setPlanActive(
    @Param('planId') planId: string,
    @Body() body: { isActive: boolean },
  ) {
    await this.repo.setPlanActive(planId, body.isActive)
  }

  @Delete('plans/:planId/features/:featureSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'planId', type: 'string' })
  @ApiParam({ name: 'featureSlug', type: 'string' })
  @ApiOperation({ summary: 'Remove a feature from a plan' })
  @ApiResponse({ status: 204, description: 'Feature removed from plan' })
  async removeFeatureFromPlan(
    @Param('planId') planId: string,
    @Param('featureSlug') featureSlug: string,
  ) {
    await this.repo.removeFeatureFromPlan(planId, featureSlug)
  }

  @Get('cabinets/:cabinetId/subscription')
  @ApiParam({ name: 'cabinetId', type: 'string' })
  @ApiOperation({ summary: 'Get active subscription for a cabinet' })
  async getCabinetSubscription(@Param('cabinetId') cabinetId: string) {
    return this.repo.getCabinetFullSubscription(cabinetId)
  }

  @Patch('cabinets/:cabinetId/subscription')
  @ApiParam({ name: 'cabinetId', type: 'string' })
  @ApiOperation({ summary: 'Assign or change the plan for a cabinet' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { planId: { type: 'string' } },
      required: ['planId'],
    },
  })
  async upsertCabinetSubscription(
    @Param('cabinetId') cabinetId: string,
    @Body() body: { planId: string },
  ) {
    await this.repo.upsertCabinetSubscription(cabinetId, body.planId)
    return this.repo.getCabinetFullSubscription(cabinetId)
  }

  @Get('cabinets/:cabinetId/overrides')
  @ApiParam({ name: 'cabinetId', type: 'string' })
  @ApiOperation({ summary: 'List all feature overrides for a cabinet' })
  async getCabinetOverrides(@Param('cabinetId') cabinetId: string) {
    return this.repo.getCabinetFullOverrides(cabinetId)
  }

  @Post('cabinets/:cabinetId/overrides')
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'cabinetId', type: 'string' })
  @ApiOperation({ summary: 'Add or update a feature override for a cabinet' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featureSlug: { type: 'string' },
        type: { type: 'string', enum: ['GRANT', 'BLOCK'] },
        source: { type: 'string', enum: ['ADD_ON', 'CUSTOM_CONTRACT', 'TRIAL', 'GIFT', 'ADMIN'] },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        notes: { type: 'string', nullable: true },
      },
      required: ['featureSlug', 'type', 'source'],
    },
  })
  async addCabinetOverride(
    @Param('cabinetId') cabinetId: string,
    @Body() body: { featureSlug: string; type: string; source: string; expiresAt?: string | null; notes?: string | null },
  ) {
    await this.repo.addCabinetOverride({
      cabinetId,
      featureSlug: body.featureSlug,
      type: body.type as OverrideType,
      source: body.source,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      notes: body.notes ?? null,
    })
    return this.repo.getCabinetFullOverrides(cabinetId)
  }

  @Delete('cabinets/:cabinetId/overrides/:featureSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'cabinetId', type: 'string' })
  @ApiParam({ name: 'featureSlug', type: 'string' })
  @ApiOperation({ summary: 'Remove a feature override for a cabinet' })
  async removeCabinetOverride(
    @Param('cabinetId') cabinetId: string,
    @Param('featureSlug') featureSlug: string,
  ) {
    await this.repo.removeCabinetOverride(cabinetId, featureSlug)
  }
}
