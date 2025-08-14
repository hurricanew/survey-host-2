import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { UserRole, type AuthUser, type GoogleOAuthUser } from '@survey-platform/shared/types';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
    googleId: 'google-123',
    picture: 'https://example.com/pic.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
  };

  const mockGoogleUser: GoogleOAuthUser = {
    id: 'google-123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/pic.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByGoogleId: jest.fn(),
            findByEmail: jest.fn(),
            updateUser: jest.fn(),
            createFromGoogle: jest.fn(),
            toAuthUser: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateGoogleUser', () => {
    it('should return existing user found by Google ID', async () => {
      usersService.findByGoogleId.mockResolvedValue(mockUser);
      usersService.toAuthUser.mockReturnValue(mockAuthUser);

      const result = await authService.validateGoogleUser(mockGoogleUser);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google-123');
      expect(usersService.toAuthUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthUser);
    });

    it('should update existing user with Google ID when found by email', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue({ ...mockUser, googleId: 'google-123' });
      usersService.toAuthUser.mockReturnValue(mockAuthUser);

      const result = await authService.validateGoogleUser(mockGoogleUser);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google-123');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.updateUser).toHaveBeenCalledWith('1', {
        googleId: 'google-123',
        picture: 'https://example.com/pic.jpg',
      });
      expect(result).toEqual(mockAuthUser);
    });

    it('should create new user when not found', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createFromGoogle.mockResolvedValue(mockUser);
      usersService.toAuthUser.mockReturnValue(mockAuthUser);

      const result = await authService.validateGoogleUser(mockGoogleUser);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google-123');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.createFromGoogle).toHaveBeenCalledWith(mockGoogleUser);
      expect(result).toEqual(mockAuthUser);
    });
  });

  describe('login', () => {
    it('should return login response with token', async () => {
      const mockToken = 'jwt-token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(mockAuthUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
      });
      expect(result).toEqual({
        user: mockAuthUser,
        token: mockToken,
      });
    });
  });

  describe('validateJwtPayload', () => {
    it('should return auth user when user exists', async () => {
      const payload = { sub: '1' };
      usersService.findById.mockResolvedValue(mockUser);
      usersService.toAuthUser.mockReturnValue(mockAuthUser);

      const result = await authService.validateJwtPayload(payload);

      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(usersService.toAuthUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthUser);
    });

    it('should return null when user does not exist', async () => {
      const payload = { sub: '1' };
      usersService.findById.mockResolvedValue(null);

      const result = await authService.validateJwtPayload(payload);

      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(result).toBeNull();
    });
  });
});