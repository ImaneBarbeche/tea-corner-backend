import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Res,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import { SignInDto } from './sign-in.dto';
import { Public } from '../decorators/auth.decorator';
import type { Response, Request as ExpressRequest } from 'express';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(
      signInDto.username,
      signInDto.password,
      response,
    );
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signUp(
    @Body() payload: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signUp(payload, response);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-tokens')
  async refreshTokens(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = req.user as { user: User; refreshTokenExpiresAt: Date };
    const { user, refreshTokenExpiresAt } = payload;
    const currentRefreshToken = req.headers.authorization?.split(' ')[1];

    return this.authService.refreshTokens(
      user.id,
      currentRefreshToken!,
      refreshTokenExpiresAt,
      res,
    );
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
