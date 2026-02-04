import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findByUsername(username);
    // if (!user || user.password != pass) { // normally is it risky to compare the password directly, we should use argon2 to verify this
    //   throw new UnauthorizedException();
    // }

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
      role: user.role,
    };

    return {
      // Here the JWT secret key that's used for signing the payload
      // is the key that was passsed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(createUserDto: CreateUserDto) {
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
      role: user.role,
    };

    // // exclude password from answer and return the jwt token
    // const { password, ...userWithoutPassword } = user;

    return {
      access_token: await this.jwtService.signAsync(payload), // IMPORTANT
      user
    };
  }
}
