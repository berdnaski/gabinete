import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new citizen account' })
  @ApiResponse({ status: 201, description: 'JWT token pair', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive a JWT' })
  @ApiResponse({ status: 200, description: 'JWT token pair', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }
}
