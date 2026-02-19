import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { EmailVerificationToken } from './email-verification-token.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        { provide: JwtService, useValue: {} },
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AuthRefreshTokenService,
          useValue: { generateTokenPair: jest.fn() },
        },
        {
          provide: getRepositoryToken(EmailVerificationToken),
          useValue: { insert: jest.fn(), find: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should hash a password correctly', async () => {
    // Arrange
    const password = 'monMotDePasse';

    // Act
    const hash = await service.hashPassword(password);

    // Assert
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);

    const isHashed = await argon2.verify(hash, password);
    expect(isHashed).toBe(true);
  });
});
