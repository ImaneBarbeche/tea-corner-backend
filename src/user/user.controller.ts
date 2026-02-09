import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from 'src/enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { User } from './user.entity';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthGuard } from 'src/guards/auth.guards';
import { Public } from 'src/decorators/auth.decorator';
import { UpdateUserDto } from './update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/profile')
  // user needs to be logged in
  @UseGuards(AuthGuard)
  async findUserProfile(@Request() req): Promise<User> {
    // using the request to get the user
    const user = await this.userService.findByUsername(req.user.username);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  @Patch('/profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req,
    @Body() UpdateUserDto: UpdateUserDto,
  ): Promise<User> {
    console.log(req.user);
    return this.userService.update(req.user.sub, UpdateUserDto);
  }

  @Get('/user-management/all')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAllUsers(): Promise<User[] | null> {
    const users = await this.userService.findAll();

    if (!users) {
      throw new NotFoundException(`No users were found`);
    }

    return users;
  }

  // @Roles(Role.Admin)
  // @UseGuards(AuthGuard, RolesGuard)
  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<User> {
  //   const user = await this.userService.findOne(id);
  //   if (!user) {
  //     throw new NotFoundException(`User with id '${id}' not found`);
  //   }
  //   return user;
  // }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  @UseGuards(AuthGuard)
  async findOneByUsername(
    @Param('username') username: string,
  ): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }
}

// FindOneParams, like a DTO, is simply a class that defines validation rules using class-validator
