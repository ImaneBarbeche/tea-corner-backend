import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guards';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/create-user.dto';
import { SignInDto } from './sign-in.dto';
import { Public } from '../decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signUp(@Body() payload: CreateUserDto) {
    return this.authService.signUp(payload);
  }
}
