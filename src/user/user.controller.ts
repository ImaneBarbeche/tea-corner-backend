import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  @Roles(Role.ADMIN)
  findOneByUsername(@Param('username') username: string): Promise<User | null> {
    const user = this.userService.findByUsername(username);
    return user;
  }

  @Get('/user-management/all')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  findAllUsers(): Promise<User[] | null> {
    const users = this.userService.findAll();
    return users;
  }

  // TODO: Check that the user is logged in
  @Get('/profile')
  findUserProfile(@Param('username') username: string): Promise<User | null> {
    const user = this.userService.findByUsername(username);
    return user;
  }
}

// FindOneParams, like a DTO, is simply a class that defines validation rules using class-validator
