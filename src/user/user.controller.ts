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
import { Role } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { User } from './user.entity';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Public } from '../decorators/auth.decorator';
import { UpdateUserDto } from './update-user.dto';
import { UpdateUsernameDto } from './update-username.dto';
import { ApiCookieAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: 'User profile' })
  @ApiResponse({ status: 200, description: 'A user object' })
  // @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @UseInterceptors(ClassSerializerInterceptor)
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

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('/profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req,
    @Body() UpdateUserDto: UpdateUserDto,
  ): Promise<User> {
    console.log(req.user);
    return this.userService.update(req.user.sub, UpdateUserDto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update username' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('/username')
  @UseGuards(AuthGuard)
  async updateUsername(
    @Request() req,
    @Body() UpdateUsernameDto: UpdateUsernameDto,
  ): Promise<{ message: string }> {
    console.log(req.user);
    try {
      await this.userService.updateUserName(
        req.user.sub,
        UpdateUsernameDto.user_name,
      );
      return { message: 'username updated successfully' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all users' })
  @UseInterceptors(ClassSerializerInterceptor)
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

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get user by username' })
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
