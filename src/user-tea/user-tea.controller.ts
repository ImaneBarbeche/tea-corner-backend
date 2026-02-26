import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserTeaService } from './user-tea.service';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { UserTea } from './user-tea.entity';
import { CreateUserTeaDto } from './create-user-tea.dto';
import { UpdateUserTeaDto } from './update-user-tea.dto';

@Controller('user-tea')
export class UserTeaController {
  constructor(private userTeaService: UserTeaService) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get all user teas (admin only)',
  })
  @Get('/all')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAllTeas(): Promise<UserTea[]> {
    const userTea = await this.userTeaService.findAll();

    if (!userTea) {
      throw new NotFoundException(`No tea was found`);
    }

    return userTea;
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary:
      "Get all teas that have been added to the user's library (system, public, and their own creations)",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/library')
  @UseGuards(AuthGuard)
  async findUserTeaLibrary(@Request() req): Promise<UserTea[] | null> {
    const userTeas = await this.userTeaService.findUserLibrary(req.user.sub);

    // checking whether there is any tea in the service

    return userTeas;
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get user tea by ID' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @UseGuards(AuthGuard)
  async findTeaById(@Param('id') id: string, @Request() req): Promise<UserTea> {
    const tea = await this.userTeaService.findOne(id, req.user.sub);

    return tea;
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new user tea' })
  @Post('/create')
  @UseGuards(AuthGuard)
  async createTea(
    @Body() createUserTeaDto: CreateUserTeaDto,
    @Request() req,
  ): Promise<UserTea> {
    const teaData = {
      ...createUserTeaDto,
      user: { id: req.user.sub },
    };

    return this.userTeaService.create(teaData, req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a user tea' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async updateTea(
    @Param('id') id: string,
    @Body() updateUserTeaDto: UpdateUserTeaDto,
    @Request() req,
  ): Promise<UserTea> {
    return await this.userTeaService.update(id, updateUserTeaDto, req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a tea' })
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteTea(@Param('id') id: string, @Request() req): Promise<void> {
    const tea = await this.userTeaService.findOne(id, req.user.sub);

    if (!tea) {
      throw new NotFoundException(`Tea with ID ${id} could not be found`);
    }

    await this.userTeaService.remove(id);
  }
}
