import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/create-user.dto';
import * as argon2 from 'argon2';
import type { Response } from 'express';
import { User } from '../user/user.entity';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import * as crypto from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private authRefreshTokenService: AuthRefreshTokenService,
    private emailService: EmailService,
    @InjectRepository(EmailVerificationToken)
    private emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken)
    private passwordResetRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
    // response: Response,
  ): Promise<{
    message: string;
  }> {
    // Hash with Argon2
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const data = {
      ...createUserDto,
      password: hashedPassword,
      email_verified: false,
    };

    // creating the user
    const user = await this.userService.create(data);

    // generating token verification email
    const emailToken = await this.generateEmailVerificationToken(user);

    // sending the email
    await this.emailService.sendVerificationEmail(user, emailToken);

    return {
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
    };
  }

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
      secure: false, // true in prod
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // true in prod
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
    return tokens;
  }

  async refreshTokens(
    userId: string,
    currentRefreshToken: string,
    response: Response,
  ) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isValid = await this.authRefreshTokenService.validateRefreshToken(
      currentRefreshToken,
      userId,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    // only access token is created
    const payload = {
      sub: user.id,
      username: user.user_name,
      role: user.role,
    };

    const newAccessToken = this.authRefreshTokenService['jwtService'].sign(
      payload,
      {
        expiresIn: '15m',
      },
    );

    // update access token
    response.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    if (process.env.NODE_ENV === 'development') {
      return { access_token: newAccessToken };
    }

    return { message: 'Access token refreshed' };
  }

  async validateUser(username: string, pass: string): Promise<object | null> {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;
    if (!user.email_verified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre email avant de vous connecter',
      );
    }

    const isMatch = await argon2.verify(user.password, pass);
    if (!isMatch) return null;

    const { password: _, ...result } = user;

    return result;
  }

  async generateEmailVerificationToken(user: User) {
    const token = crypto.randomBytes(32).toString('hex'); //token send in the email
    const hashToken = await argon2.hash(token); // token stored in the db
    const expires_at = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await this.emailVerificationTokenRepository.insert({
      email_token: hashToken,
      user: user,
      expires_at,
      used: false,
    });

    return token;
  }

  async verifyEmail(token: string) {
    // take unused tokens
    const tokens = await this.emailVerificationTokenRepository.find({
      where: { used: false },
      order: { created_at: 'DESC' },
      relations: ['user'],
    });
    // if no tokens, send error
    if (!tokens.length) {
      throw new BadRequestException('Token invalide ou déjà utilisé');
    }

    // tokenRecord needs to store 2 values, before the loop it stores null and after it stores EmailVerificationToken object
    let tokenRecord: EmailVerificationToken | null = null;

    for (const t of tokens) {
      // argon2.verify compare brut token with hashed token
      const isMatch = await argon2.verify(t.email_token, token);

      if (isMatch) {
        tokenRecord = t; // change the value because the token is found
        break;
      }
    }

    if (!tokenRecord) {
      throw new BadRequestException('Token invalide');
    }

    // verify expiration
    if (tokenRecord.expires_at < new Date()) {
      throw new BadRequestException('Token expiré');
    }

    // get the associated user
    const user = tokenRecord.user;

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // mark token as used
    tokenRecord.used = true;
    await this.emailVerificationTokenRepository.save(tokenRecord);

    // verify user email
    user.email_verified = true;
    await this.userService.save(user);

    return { message: 'Email vérifié avec succès' };
  }

  async logout(refreshToken: string, response: Response) {
    // Révoquer le refresh token en DB
    if (refreshToken) {
      await this.authRefreshTokenService.revokeRefreshToken(refreshToken);
    }

    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return { message: 'Logout successful' };
  }

  async hashPassword(password: string) {
    return argon2.hash(password);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) return; // do not reveal if the email exists

    const rawToken = crypto.randomBytes(32).toString('hex'); //token send in the email
    const hashedToken = await argon2.hash(rawToken); // token stored in the db
    const expires_at = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await this.passwordResetRepository.insert({
      password_token: hashedToken,
      user: user,
      expires_at,
    });

    await this.emailService.sendResetEmail(user, rawToken);
  }

  async resetPassword(token: string, newPassword: string) {
    if (!newPassword) {
      throw new BadRequestException('New password is required');
    }
    // get non expired tokens
    const resets = await this.passwordResetRepository.find({
      where: {
        expires_at: MoreThan(new Date()), // filters expired tokens
      },
      relations: ['user'],
    });

    let resetRecord: PasswordResetToken | null = null;

    // compare raw tokens with hashed tokens
    for (const r of resets) {
      const match = await argon2.verify(r.password_token, token);
      if (match) {
        resetRecord = r;
        break;
      }
    }
    if (!resetRecord) {
      throw new BadRequestException('Invalid token');
    }

    if (resetRecord.expires_at < new Date()) {
      throw new BadRequestException('Token expired');
    }
    // update password
    resetRecord.user.password = await this.hashPassword(newPassword);

    await this.userRepository.save(resetRecord.user);
    await this.passwordResetRepository.delete(resetRecord.id);

    return { message: 'Password updated successfully' };
  }
}
