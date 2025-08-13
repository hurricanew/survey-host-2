import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { type ApiResponse, type AuthUser } from '@survey-platform/shared/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    const user = req.user as AuthUser;
    const loginResponse = await this.authService.login(user);
    
    // TODO: In Task 3, redirect to frontend with token or session
    // For now, return the token as JSON for testing
    res.json({
      success: true,
      data: loginResponse,
      message: 'Authentication successful',
    } as ApiResponse);
  }

  @Post('logout')
  async logout(): Promise<ApiResponse> {
    // TODO: In Task 4, implement session invalidation
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: AuthUser): Promise<ApiResponse> {
    return {
      success: true,
      data: user,
      message: 'Profile retrieved successfully',
    };
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async validateSession(@CurrentUser() user: AuthUser): Promise<ApiResponse> {
    return {
      success: true,
      data: { valid: true, user },
      message: 'Session is valid',
    };
  }
}