import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Res,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/create-user.dto';
import { SignInDto } from './sign-in.dto';
import { Public } from '../decorators/auth.decorator';
import type { Response, Request as ExpressRequest } from 'express';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User } from 'src/user/user.entity';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/min
  @Post('signin')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({
    status: 429,
    description: 'Trop de requêtes — rate limit dépassé',
  })
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(
      signInDto.user_name,
      signInDto.password,
      response,
    );
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  @ApiOperation({ summary: 'Création d’un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async signUp(
    @Body() payload: CreateUserDto,
    // @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signUp(payload);
  }

  @ApiCookieAuth() // indicate to swagger that this route needs an auth cookie
  @Post('logout')
  @ApiOperation({ summary: 'Déconnexion de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    return this.authService.logout(refreshToken, response);
  }

  @ApiCookieAuth() // needs refresh token
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh-tokens')
  @ApiOperation({ summary: 'Rafraîchit les tokens d’authentification' })
  @ApiResponse({ status: 200, description: 'Tokens rafraîchis avec succès' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  @ApiResponse({
    status: 429,
    description: 'Trop de requêtes — rate limit dépassé',
  })
  async refreshTokens(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = req.user as { user: User };
    const { user } = payload;
    const currentRefreshToken = req.cookies['refresh_token'];

    return this.authService.refreshTokens(user.id, currentRefreshToken!, res);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('verify-email')
  @ApiOperation({ summary: 'Vérifie l’adresse email d’un utilisateur' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token de vérification envoyé par email',
  })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  @ApiResponse({
    status: 429,
    description: 'Trop de requêtes — rate limit dépassé',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Demande de réinitialisation du mot de passe' })
  @ApiResponse({
    status: 200,
    description:
      'Si cet email existe, un lien de réinitialisation a été envoyé',
  })
  @ApiResponse({ status: 400, description: 'Email invalide' })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'If this email exists, a reset link was sent' };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @ApiOperation({
    summary: 'Réinitialise le mot de passe via un token reçu par email',
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
  })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
