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
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get all user-tea entries (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all user-tea entries returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
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
    summary: "Get the current user's tea library",
    description:
      "Returns all teas added to the user's library — system teas, public teas, and their own creations.",
  })
  @ApiResponse({
    status: 200,
    description: "User's tea library returned successfully",
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/library')
  @UseGuards(AuthGuard)
  async findUserTeaLibrary(@Request() req): Promise<UserTea[] | null> {
    return this.userTeaService.findUserLibrary(req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get a user-tea entry by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user-tea entry',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'User-tea entry returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'User-tea entry not found' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @UseGuards(AuthGuard)
  async findTeaById(@Param('id') id: string, @Request() req): Promise<UserTea> {
    return this.userTeaService.findOne(id, req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: "Add a tea to the user's library",
    description:
      'Links a tea to the current user with optional custom brewing parameters and inventory tracking.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tea added to library successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
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
  @ApiOperation({ summary: 'Update a user-tea entry' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user-tea entry to update',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'User-tea entry updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'User-tea entry not found' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async updateTea(
    @Param('id') id: string,
    @Body() updateUserTeaDto: UpdateUserTeaDto,
    @Request() req,
  ): Promise<UserTea> {
    return this.userTeaService.update(id, updateUserTeaDto, req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Remove a tea from the user's library" })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user-tea entry to delete',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Tea removed from library successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'User-tea entry not found' })
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
