import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { AuthRefreshToken } from '../entities/auth-refresh-token.entity';
import { User } from '../user/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthRefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(AuthRefreshToken)
    private authRefreshTokenRepository: Repository<AuthRefreshToken>,
  ) {}

  // creates new refresh token and stores it in the database
  async generateRefreshToken(userId: string): Promise<string> {
    const newRefreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
      },
    );

    // store new refresh token in databse
    await this.authRefreshTokenRepository.insert({
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId,
      revoked: false,
    });

    return newRefreshToken;
  }

  async generateTokenPair(user: User) {
    const payload = {
      sub: user.id,
      username: user.user_name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
      }),
      refresh_token: await this.generateRefreshToken(user.id),
    };
  }

  //  check if refresh token has been used or has expired
  async validateRefreshToken(refreshToken: string, userId: string): Promise<boolean> {
    // look for token in DB
    const token = await this.authRefreshTokenRepository.findOne({
      where: { refreshToken, userId, revoked: false },
    });

    // not found or revoked
    if (!token) return false;

    // expired
    if (token.expiresAt <= new Date()) return false;

    // valid
    return true;
  }

  // revoke a specific token after loging out (1 device)
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.authRefreshTokenRepository.update(
      { refreshToken },
      { revoked: true },
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async clearExpiredRefreshTokens() {
    await this.authRefreshTokenRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
  }
}
