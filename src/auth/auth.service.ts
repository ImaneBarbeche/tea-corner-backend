import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
    response: Response,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // verify with argon2
    const isPasswordValid = await argon2.verify(user.password, pass);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: user.id,
      username: user.user_name,
      role: user.roles,
    };
    const token = await this.jwtService.signAsync(payload);
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
    });
    return { message: 'Login successful' };
  }


  // token in the sign up method might not be necessary if the user validates his email before being able to login. can keep if he instantly logs in after being registered

  async signUp(
    createUserDto: CreateUserDto,
    response: Response,
  ): Promise<{ message: string; user: User }> {
    // Hash with Argon2
    const hashedPassword = await argon2.hash(createUserDto.password);

    const data = {
      ...createUserDto,
      password: hashedPassword,
    };

    // creating the user
    const user = await this.userService.create(data);

    // creating the jwt payload
    const payload = {
      sub: user.id,
      username: user.user_name,
      role: user.roles,
    };

    const token = await this.jwtService.signAsync(payload);
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
    });
    return { message: 'Success', user };
  }
}
