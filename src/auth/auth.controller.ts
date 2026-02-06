import { Body, Controller, Post, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor, Request, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import { SignInDto } from './sign-in.dto';
import { Public } from '../decorators/auth.decorator';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto, @Res() response: Response) {
    return this.authService.signIn(signInDto.username, signInDto.password, response);
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signUp(@Body() payload: CreateUserDto, @Res() response: Response) {
    return this.authService.signUp(payload, response);
  }
}
