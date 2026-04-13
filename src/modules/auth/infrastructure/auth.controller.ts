import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { GoogleAuthGuard } from '../../../shared/guards/google-auth.guard';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ForgotPasswordUseCase } from '../application/forgot-password.use-case';
import { RequestPasswordChangeUseCase } from '../application/request-password-change.use-case';
import { ConfirmPasswordChangeUseCase } from '../application/confirm-password-change.use-case';
import { GoogleLoginUseCase } from '../application/google-login.use-case';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { ResetPasswordUseCase } from '../application/reset-password.use-case';
import { VerifyEmailUseCase } from '../application/verify-email.use-case';
import { RefreshTokenUseCase } from '../application/refresh-token.use-case';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { GoogleUser } from './google.strategy';
import { AuthCookiesInterceptor } from './interceptors/auth-cookies.interceptor';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { ClearCookiesInterceptor } from './interceptors/clear-cookies.interceptor';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly requestPasswordChangeUseCase: RequestPasswordChangeUseCase,
    private readonly confirmPasswordChangeUseCase: ConfirmPasswordChangeUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new citizen account' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    return this.registerUseCase.execute(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email using token' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    return this.verifyEmailUseCase.execute(dto.token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuthCookiesInterceptor)
  @ApiOperation({ summary: 'Authenticate and receive a JWT via Cookies' })
  @ApiResponse({
    status: 200,
    description: 'Success - Tokens set in HttpOnly cookies',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuthCookiesInterceptor)
  @ApiOperation({ summary: 'Refresh tokens via Cookies' })
  @ApiResponse({ status: 200, description: 'New token pair set in Cookies', type: AuthResponseDto })
  async refresh(@RefreshToken() refreshToken: string): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully context message',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update password using reset token' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.resetPasswordUseCase.execute(dto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a password change (sends confirmation email)',
  })
  @ApiResponse({ status: 200, description: 'Confirmation email sent' })
  async requestChangePassword(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.requestPasswordChangeUseCase.execute(user.id, dto);
  }

  @Post('confirm-change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password change using token' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async confirmChangePassword(@Body('token') token: string): Promise<{ message: string }> {
    return this.confirmPasswordChangeUseCase.execute(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initialize OAuth flow with Google' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google authorization page',
  })
  googleAuth() { }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClearCookiesInterceptor)
  @ApiOperation({ summary: 'Clear auth cookies' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(AuthCookiesInterceptor)
  @ApiOperation({ summary: 'Google OAuth callback setting Cookies' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend after setting Cookies',
  })
  async googleAuthCallback(@Req() req: any): Promise<AuthResponseDto> {
    return this.googleLoginUseCase.execute(req.user as GoogleUser);
  }
}
