import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    // private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user?.password != password) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }

  
  async signUp(createUserDto: CreateUserDto) {
    const data = {
      ...createUserDto,
      // password: hashPass,
    };
    return this.userService.create(data);
  }
}
