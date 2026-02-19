import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
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
import { UpdateUserDto } from './update-user.dto';
import { UpdateUsernameDto } from './update-username.dto';
import { ApiCookieAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UpdatePasswordDto } from './update-password.dto';
import { UpdateEmailDto } from './update-email.dto';

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

  @Patch('email')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Update user email address',
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'New email must be different from current email',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid current password',
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateEmail(@Request() req, @Body() updateEmailDto: UpdateEmailDto) {
    return this.userService.updateEmail(req.user.sub, updateEmailDto);
  }

  @Patch('password')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Update user password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'New password and confirmation do not match',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid current password',
  })
  @UseGuards(AuthGuard)
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(req.user.sub, updatePasswordDto);
  }
}
