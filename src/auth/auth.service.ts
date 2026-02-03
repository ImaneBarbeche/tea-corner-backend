import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    // private jwtService: JwtService,
  ) {}

//   async signIn(username: string, password: string): Promise<any> {
//     const user = await this.userService.findOne(username);
//     if (user?.password != password) {
//       throw new UnauthorizedException();
//     }
//     const { password, ...result } = user;
//     // TODO: Generate a JWT and return it here
//     // instead of the user object
//     return result;
//   }


  async signUp(createUserDto: CreateUserDto) {
    // Hasher avec Argon2
    const hashedPassword = await argon2.hash(createUserDto.password);

    const data = {
      ...createUserDto,
      password: hashedPassword,
    };
    return this.userService.create(data);
  }
}
