import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../strategies/local-strategy';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRefreshToken } from '../entities/auth-refresh-token.entity';
import { EmailService } from './email.service';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES'),
        },
      }),
    }),
  ],

  providers: [
    AuthService,
    LocalStrategy,
    JwtRefreshStrategy,
    AuthRefreshTokenService,
    EmailService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, AuthRefreshTokenService],
})
export class AuthModule {}
