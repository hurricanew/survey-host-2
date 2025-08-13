import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole, type AuthUser, type LoginResponse, type GoogleOAuthUser } from '@survey-platform/shared/types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateGoogleUser(googleUser: GoogleOAuthUser): Promise<AuthUser> {
    // Try to find existing user by Google ID first
    let user = await this.usersService.findByGoogleId(googleUser.id);
    
    if (!user) {
      // Try to find by email (in case user signed up differently)
      user = await this.usersService.findByEmail(googleUser.email);
      
      if (user) {
        // Update existing user with Google ID
        user = await this.usersService.updateUser(user.id, {
          googleId: googleUser.id,
          picture: googleUser.picture,
        });
      } else {
        // Create new user
        user = await this.usersService.createFromGoogle(googleUser);
      }
    }

    return this.usersService.toAuthUser(user);
  }

  async login(user: AuthUser): Promise<LoginResponse> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role 
    };

    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async validateJwtPayload(payload: any): Promise<AuthUser | null> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      return null;
    }
    return this.usersService.toAuthUser(user);
  }
}