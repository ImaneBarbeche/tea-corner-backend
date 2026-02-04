import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { User } from './user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Public } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guards';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }
    return user;
  }
}

// FindOneParams, like a DTO, is simply a class that defines validation rules using class-validator
