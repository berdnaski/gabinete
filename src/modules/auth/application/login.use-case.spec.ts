import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByEmailUseCase } from '../../users/application/find-user-by-email.use-case';
import { ValidatePasswordUseCase } from '../../users/application/validate-password.use-case';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { JwtPayload, JwtTokenService } from './jwt-token.service';
import { LoginUseCase } from './login.use-case';

describe('JwtTokenService', () => {
  let jwtTokenService: JwtTokenService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    jwtTokenService = module.get(JwtTokenService);
    jwtService = module.get(JwtService);
  });

  it('should sign a token with sub set to the user ID', () => {
    const token = jwtTokenService.sign({
      id: 'user-123',
      email: 'test@example.com',
    });
    const decoded = jwtService.verify<JwtPayload>(token.accessToken);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('test@example.com');
  });

  it('should return an AuthTokenEntity with accessToken and expiresIn', () => {
    const token = jwtTokenService.sign({ id: 'user-abc', email: 'a@b.com' });
    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('expiresIn');
    expect(typeof token.accessToken).toBe('string');
    expect(typeof token.expiresIn).toBe('number');
  });
});

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  const mockFindUserByEmail = { execute: jest.fn() };
  const mockValidatePassword = { execute: jest.fn() };
  const mockJwtTokenService = { sign: jest.fn() };
  const mockTokensRepository = { upsert: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: FindUserByEmailUseCase, useValue: mockFindUserByEmail },
        { provide: ValidatePasswordUseCase, useValue: mockValidatePassword },
        { provide: JwtTokenService, useValue: mockJwtTokenService },
        { provide: ITokensRepository, useValue: mockTokensRepository },
      ],
    }).compile();

    loginUseCase = module.get(LoginUseCase);
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    mockFindUserByEmail.execute.mockResolvedValue(null);
    await expect(
      loginUseCase.execute({ email: 'x@x.com', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    mockFindUserByEmail.execute.mockResolvedValue({
      id: '1',
      email: 'x@x.com',
      password: 'hashed',
    });
    mockValidatePassword.execute.mockResolvedValue(false);
    await expect(
      loginUseCase.execute({ email: 'x@x.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return an AuthTokenEntity on valid credentials', async () => {
    mockFindUserByEmail.execute.mockResolvedValue({
      id: 'user-1',
      email: 'x@x.com',
      password: 'hashed',
      isVerified: true,
    });
    mockValidatePassword.execute.mockResolvedValue(true);
    mockJwtTokenService.sign.mockReturnValue({
      accessToken: 'tok',
      expiresIn: 3600,
    });

    const result = await loginUseCase.execute({
      email: 'x@x.com',
      password: 'correct',
    });
    expect(result).toEqual({ accessToken: 'tok', expiresIn: 3600 });
    expect(mockJwtTokenService.sign).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'x@x.com',
      password: 'hashed',
      isVerified: true,
    });
  });
});
