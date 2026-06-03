import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MagicBytesValidator } from 'src/shared/validators/magic-bytes.validator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserAccessGuard } from 'src/shared/guards/user-access.guard';
import { UserRole } from '../domain/user.entity';

import { ListUsersUseCase } from '../application/list-users.use-case';
import { FindUserByIdUseCase } from '../application/find-user-by-id.use-case';
import { UpdateUserProfileUseCase } from '../application/update-user-profile.use-case';
import { DeleteAccountUseCase } from '../application/delete-account.use-case';
import { ListUserNeighborhoodsUseCase } from '../application/list-user-neighborhoods.use-case';
import { AddUserNeighborhoodUseCase } from '../application/add-user-neighborhood.use-case';
import { RemoveUserNeighborhoodUseCase } from '../application/remove-user-neighborhood.use-case';
import { SetPrimaryNeighborhoodUseCase } from '../application/set-primary-neighborhood.use-case';

import { ListUsersDto } from '../dto/list-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserNeighborhoodDto } from '../dto/create-user-neighborhood.dto';
import { UserNeighborhoodResponseDto } from '../dto/user-neighborhood-response.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserEntity } from '../domain/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly listUserNeighborhoodsUseCase: ListUserNeighborhoodsUseCase,
    private readonly addUserNeighborhoodUseCase: AddUserNeighborhoodUseCase,
    private readonly removeUserNeighborhoodUseCase: RemoveUserNeighborhoodUseCase,
    private readonly setPrimaryNeighborhoodUseCase: SetPrimaryNeighborhoodUseCase,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async list(@Query() filters: ListUsersDto) {
    return this.listUsersUseCase.execute(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() requester: UserResponseDto,
  ) {
    const user = await this.findUserByIdUseCase.execute(id);

    const isSelf = requester.id === user.id;
    const isAdmin = requester.role === UserRole.ADMIN;

    if (isSelf || isAdmin) {
      return user;
    }

    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isCabinetMember: user.isCabinetMember,
    };
  }

  @Patch(':id')
  @UseGuards(UserAccessGuard)
  @ApiOperation({ summary: 'Update user profile (Self)' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
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
  ) {
    return this.updateUserProfileUseCase.execute(id, dto, file);
  }

  @Delete(':id')
  @UseGuards(UserAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account (Soft Delete - Self)' })
  @ApiResponse({ status: 204, description: 'Account deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.deleteAccountUseCase.execute(id);
  }

  @Get('me/neighborhoods')
  @ApiOperation({ summary: 'List saved neighborhoods for the authenticated user' })
  @ApiResponse({ status: 200, type: [UserNeighborhoodResponseDto] })
  async listNeighborhoods(
    @CurrentUser() user: UserEntity,
  ): Promise<UserNeighborhoodResponseDto[]> {
    return this.listUserNeighborhoodsUseCase.execute(user.id);
  }

  @Post('me/neighborhoods')
  @ApiOperation({ summary: 'Add a neighborhood to the authenticated user' })
  @ApiResponse({ status: 201, type: UserNeighborhoodResponseDto })
  @ApiResponse({ status: 400, description: 'Maximum neighborhoods reached' })
  @ApiResponse({ status: 409, description: 'Neighborhood already saved' })
  async addNeighborhood(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateUserNeighborhoodDto,
  ): Promise<UserNeighborhoodResponseDto> {
    return this.addUserNeighborhoodUseCase.execute({ userId: user.id, ...dto });
  }

  @Delete('me/neighborhoods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a saved neighborhood' })
  @ApiResponse({ status: 204, description: 'Removed' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async removeNeighborhood(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
  ): Promise<void> {
    return this.removeUserNeighborhoodUseCase.execute(id, user.id);
  }

  @Patch('me/neighborhoods/:id/primary')
  @ApiOperation({ summary: 'Set a neighborhood as primary' })
  @ApiResponse({ status: 200, type: [UserNeighborhoodResponseDto] })
  @ApiResponse({ status: 404, description: 'Not found' })
  async setPrimaryNeighborhood(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
  ): Promise<UserNeighborhoodResponseDto[]> {
    return this.setPrimaryNeighborhoodUseCase.execute(id, user.id);
  }
}
