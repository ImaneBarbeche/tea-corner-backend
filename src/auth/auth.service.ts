import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { User } from 'src/user/user.entity';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import * as nodemailer from 'nodemailer';

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
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: process.env.EMAIL_VERIFY_SECRET,
        expiresIn: '1d',
      },
    );
  }

  async sendVerificationEmail(user: User, token: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${token}`;
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
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.EMAIL_VERIFY_SECRET,
      });

      const user = await this.userService.findOne(payload.sub);

      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      user.email_verified = true;
      await this.userService.save(user);

      return { message: 'Email vérifié avec succès' };
    } catch (e) {
      throw new BadRequestException('Token invalide ou expiré');
    }
  }
}
