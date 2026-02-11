import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import * as argon2 from 'argon2';
import type { Response } from 'express';
import { User } from 'src/user/user.entity';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { EmailVerificationToken } from './email-verification-token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private authRefreshTokenService: AuthRefreshTokenService,
  ) {}

  @InjectRepository(EmailVerificationToken)
  private emailVerificationTokenRepository: Repository<EmailVerificationToken>;

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

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
    return tokens;
  }

  async signUp(
    createUserDto: CreateUserDto,
    response: Response,
  ): Promise<{
    message: string;
  }> {
    // Hash with Argon2
    const hashedPassword = await argon2.hash(createUserDto.password);

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
    await this.sendVerificationEmail(user, emailToken);

    return {
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
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

    // creates new access token
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    // creates new refresh token
    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // only return tokens in dev mode, for postman testing
    if (process.env.NODE_ENV === 'development') {
      return tokens;
    }
    return { message: 'Tokens refreshed' };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;
    if (!user.email_verified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre email avant de vous connecter',
      );
    }

    const isMatch = await argon2.verify(user.password, pass);
    if (!isMatch) return null;

    const { password, ...result } = user;

    return result;
  }

  async generateEmailVerificationToken(user: User) {
    const token = crypto.randomBytes(32).toString('hex'); //token send in the email
    const hashToken = await argon2.hash(token); // token stored in the db
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await this.emailVerificationTokenRepository.insert({
      emailToken: hashToken,
      userId: user.id,
      expiresAt,
      used: false,
    });

    return token;
  }

  async sendVerificationEmail(user: User, token: string) {
    const url = `${process.env.BACKEND_URL}/auth/verify-email?token=${token}`;
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
    await transporter.sendMail({
      from: '"TeaCorner" <no-reply@teacorner.com>',
      to: user.email,
      subject: 'Vérifiez votre email',
      html: ` <h1>Bienvenue sur TeaCorner!</h1> <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p> <a href="${url}">${url}</a> `,
    });
    console.log('Email envoyé à :', user.email);
  }

  async verifyEmail(token: string) {
    // take unused tokens
    const tokens = await this.emailVerificationTokenRepository.find({
      where: { used: false },
      order: { createdAt: 'DESC' },
    });
    // if no tokens, send error
    if (!tokens.length) {
      throw new BadRequestException('Token invalide ou déjà utilisé');
    }

    // tokenRecord needs to store 2 values, before the loop it stores null and after it stores EmailVerificationToken object
    let tokenRecord: EmailVerificationToken | null = null;

    for (const t of tokens) {
      // argon2.verify compare brut token with hashed token
      const isMatch = await argon2.verify(t.emailToken, token);

      if (isMatch) {
        tokenRecord = t; // change the value because the token is found
        break;
      }
    }

    if (!tokenRecord) {
      throw new BadRequestException('Token invalide');
    }

    // verify expiration
    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token expiré');
    }

    // get the associated user
    const user = await this.userService.findOne(tokenRecord.userId);

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

  async logout(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }
}
