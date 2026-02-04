import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  findOneByUsername(@Param('username') username: string): Promise<User | null> {
    const user = this.userService.findByUsername(username);
    return user;
  }
}

// FindOneParams, like a DTO, is simply a class that defines validation rules using class-validator
