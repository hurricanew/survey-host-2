import { Controller, Get, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { type ApiResponse, type AuthUser, type GoogleOAuthUser } from '@survey-platform/shared/types';

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
    try {
      const user = req.user as AuthUser;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'User information not available',
        } as ApiResponse);
      }

      const loginResponse = await this.authService.login(user);
      
      // TODO: In production, redirect to frontend with secure token handling
      res.json({
        success: true,
        data: loginResponse,
        message: 'Authentication successful',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Authentication process failed',
      } as ApiResponse);
    }
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

  @Post('google/validate')
  async validateGoogleUser(@Body() body: { googleUser: GoogleOAuthUser }): Promise<ApiResponse> {
    try {
      const { googleUser } = body;
      
      if (!googleUser?.email || !googleUser?.name || !googleUser?.id) {
        return {
          success: false,
          error: 'Invalid request',
          message: 'Missing required Google user information',
        };
      }

      const user = await this.authService.validateGoogleUser(googleUser);
      
      return {
        success: true,
        data: user,
        message: 'User validated/created successfully',
      };
    } catch (error) {
      console.error('Error validating Google user:', error);
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to validate Google user',
      };
    }
  }
}