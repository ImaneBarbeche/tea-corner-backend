import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../strategies/local-strategy';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { AuthRefreshTokenModule } from './auth-refresh-token.module';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRefreshToken } from '../entities/auth-refresh-token.entity';
import { EmailService } from './email.service';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      EmailVerificationToken,
      PasswordResetToken,      
      AuthRefreshToken,
    ]),
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'fallback-secret-key',
        signOptions: { 
          expiresIn: process.env.JWT_EXPIRES as any || '15m' },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy, AuthRefreshTokenService, EmailService,],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, AuthRefreshTokenService],
})
export class AuthModule {}
