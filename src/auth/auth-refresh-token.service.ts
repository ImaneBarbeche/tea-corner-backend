// auth-refresh-token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { AuthRefreshToken } from './auth-refresh-token.entity';
import { User } from '../user/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthRefreshTokenService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(AuthRefreshToken)
    private authRefreshTokenRepository: Repository<AuthRefreshToken>,
  ) {}

  
  async generateRefreshToken(
    userId: string,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ): Promise<string> {
    const newRefreshToken = this.jwtService.sign(
      { sub: userId },
      { 
        secret: process.env.JWT_REFRESH_SECRET, 
        expiresIn: '7d' 
      },
    );

    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      if (await this.isRefreshTokenBlacklisted(currentRefreshToken, userId)) {
        throw new UnauthorizedException('Refresh token already used');
      }

      await this.authRefreshTokenRepository.insert({
        refreshToken: currentRefreshToken,
        expiresAt: currentRefreshTokenExpiresAt,
        userId,
      });
    }

    return newRefreshToken;
  }

  private async isRefreshTokenBlacklisted(
    refreshToken: string,
    userId: string,
  ): Promise<boolean> {
    return this.authRefreshTokenRepository.existsBy({
      refreshToken,
      userId,
    });
  }

  async generateTokenPair(
    user: User,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const payload = { 
      sub: user.id, 
      username: user.user_name, 
      role: user.roles 
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '15m', 
      }),
      refresh_token: await this.generateRefreshToken(
        user.id,
        currentRefreshToken,
        currentRefreshTokenExpiresAt,
      ),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async clearExpiredRefreshTokens() {
    await this.authRefreshTokenRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
  }
}