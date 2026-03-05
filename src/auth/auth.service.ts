import {
  BadRequestException,
  ConflictException,
  Injectable,
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
import { ConfigService } from '@nestjs/config';

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
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<{
    message: string;
  }> {
    // add error handling if user already exists in database (uniqueness)
    // should show generic success message to prevent too much info for attackers
    const existing = await this.userService.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.userService.findByUsername(
      createUserDto.user_name,
    );
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

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
    user: User,
    response: Response,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // generate a token pair
    const tokens = await this.authRefreshTokenService.generateTokenPair(user);
    const accessExpire = this.configService.get('JWT_ACCESS_EXPIRES');
    const refreshExpire = this.configService.get('JWT_REFRESH_EXPIRES');

    // store in an httpOnly cookie
    // const isProd = process.env.NODE_ENV === 'production';
    const isProd = this.configService.get('NODE_ENV') === 'production';

    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: accessExpire * 1000, // 15 minutes
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: refreshExpire * 1000, // 7d
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
    const newAccessToken =
      this.authRefreshTokenService.generateAccessToken(user);

    // update access token
    // const isRefreshProd = process.env.NODE_ENV === 'production';
    const isRefreshProd = this.configService.get('NODE_ENV') === 'production';
    const accessExpire = this.configService.get('JWT_ACCESS_EXPIRES');

    response.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: isRefreshProd,
      sameSite: isRefreshProd ? 'none' : 'lax',
      // maxAge: 15 * 60 * 1000, // 15 minutes
      maxAge: accessExpire * 1000,
    });

    if (this.configService.get('NODE_ENV') === 'development') {
      return { access_token: newAccessToken };
    }

    return { message: 'Access token refreshed' };
  }

  async validateUser(username: string, pass: string): Promise<object | null> {
    const user = await this.userService.findByUsername(username);

    if (!user) return null;

    const isMatch = await argon2.verify(user.password, pass);
    if (!isMatch) return null;

    if (!user.email_verified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre email avant de vous connecter',
      );
    }

    const { password: _password, ...result } = user;

    return result;
  }

  async generateEmailVerificationToken(user: User) {
    const token = crypto.randomBytes(32).toString('hex'); //token send in the email
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    // token stored in the db
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
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const tokenRecord = await this.emailVerificationTokenRepository.findOne({
      where: { email_token: hashedToken, used: false },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }
    tokenRecord.used = true;
    await this.emailVerificationTokenRepository.save(tokenRecord);

    tokenRecord.user.email_verified = true;
    await this.userService.save(tokenRecord.user);

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
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex'); // token stored in the db
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
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await this.passwordResetRepository.findOne({
      where: {
        password_token: hashedToken,
        expires_at: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid token');
    }
    // update password
    resetRecord.user.password = await this.hashPassword(newPassword);

    await this.userRepository.save(resetRecord.user);
    await this.passwordResetRepository.delete(resetRecord.id);

    return { message: 'Password updated successfully' };
  }
}
