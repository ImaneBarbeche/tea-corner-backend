import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../auth/local-strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { AuthRefreshTokenModule } from './auth-refresh-token.module';
import { EmailVerificationToken } from './email-verification-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRefreshToken } from './auth-refresh-token.entity';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'fallback-secret-key',
        signOptions: { 
          expiresIn: process.env.JWT_EXPIRES as any || '15m' },
      }),
    }),
    AuthRefreshTokenModule, 
    TypeOrmModule.forFeature([ AuthRefreshToken, EmailVerificationToken,]),
  ],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy, AuthRefreshTokenService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, AuthRefreshTokenService],
})
export class AuthModule {}
