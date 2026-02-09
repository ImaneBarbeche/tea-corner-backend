import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { User } from 'src/user/user.entity';
import { AuthRefreshTokenService } from './auth-refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private authRefreshTokenService: AuthRefreshTokenService,
  ) {}

  async signIn(
    username: string,
    pass: string,
    response: Response,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // verify with argon2
    const isPasswordValid = await argon2.verify(user.password, pass);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // generate a token pair
    const tokens = await this.authRefreshTokenService.generateTokenPair(user);

    // store in an httpOnly cookie
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return tokens;
  }

  // token in the sign up method might not be necessary if the user validates his email before being able to login. can keep if he instantly logs in after being registered

  async signUp(
    createUserDto: CreateUserDto,
    response: Response,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: Partial<User>;
  }> {
    // Hash with Argon2
    const hashedPassword = await argon2.hash(createUserDto.password);

    const data = {
      ...createUserDto,
      password: hashedPassword,
    };

    // creating the user
    const user = await this.userService.create(data);

    const tokens = await this.authRefreshTokenService.generateTokenPair(user);
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    const { password, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async refreshTokens(
    userId: string,
    currentRefreshToken: string,
    currentRefreshTokenExpiresAt: Date,
    response: Response,
  ) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.authRefreshTokenService.generateTokenPair(
      user,
      currentRefreshToken,
      currentRefreshTokenExpiresAt,
    );

    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return tokens;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;

    const isMatch = await argon2.verify(user.password, pass);
    if (!isMatch) return null;
    const { password, ...result } = user;

    return result;
  }
}
