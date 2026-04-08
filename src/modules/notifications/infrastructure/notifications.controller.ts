import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ListNotificationsUseCase } from '../application/list-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../application/mark-notification-as-read.use-case';
import { ListNotificationsDto } from '../dto/list-notifications.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async list(
    @CurrentUser('id') userId: string,
    @Query() query: ListNotificationsDto,
  ) {
    return this.listNotificationsUseCase.execute(userId, query);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.markAsReadUseCase.execute(id, userId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.markAsReadUseCase.markAllAsRead(userId);
  }
}
