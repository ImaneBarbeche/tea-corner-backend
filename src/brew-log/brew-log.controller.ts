import {
  Controller,
  Get,
  NotFoundException,
  UseGuards,
  Request,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BrewLogService } from './brew-log.service';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { BrewLog } from './brew-log.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CreateBrewLogDto } from './create-brew-log.dto';
import { UpdateBrewLogDto } from './update-brew-log.dto';
import { BrewLogResponseDto } from './brew-log-response.dto';

@Controller('brew-log')
export class BrewLogController {
  constructor(private brewLogService: BrewLogService) {}

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
  async findAllUserLogs(): Promise<BrewLog[]> {
    const userLogs = await this.brewLogService.findAll();
    if (!userLogs) {
      throw new NotFoundException(`No user logs were found`);
    }

    return userLogs;
  }

  @ApiOperation({ summary: 'Get all public brew logs' })
  @ApiResponse({
    status: 200,
    description: 'List of all public brew logs returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @Get('/public')
  @UseGuards(AuthGuard)
  async findPublicLogs(): Promise<BrewLogResponseDto[]> {
    return this.brewLogService.findPublicBrewLogs();
  }

  @ApiOperation({ summary: "Get the current user's brew logs" })
  @ApiResponse({
    status: 200,
    description: "List of all the user's brew logs returned successfully",
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @Get('/entries')
  @UseGuards(AuthGuard)
  async findUserBrewLogs(@Request() req): Promise<BrewLogResponseDto[]> {
    return this.brewLogService.findUserBrewLogs(req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: "Add a brew log to the user's library",
  })
  @ApiResponse({
    status: 201,
    description: 'Brew log added to library successfully',
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
    @Body() dto: CreateBrewLogDto,
    @Request() req,
  ): Promise<BrewLog> {
    const logData = {
      ...dto,
      user: { id: req.user.sub },
    };

    return this.brewLogService.create(logData, req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a brew log entry' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the brew log entry to update',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'brew log updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'Brew log entry not found' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async updateTea(
    @Param('id') id: string,
    @Body() dto: UpdateBrewLogDto,
    @Request() req,
  ): Promise<BrewLog> {
    return this.brewLogService.update(id, dto, req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Remove a log from the user's library" })
  @ApiParam({
    name: 'id',
    description: 'UUID of the log entry to delete',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Log removed from library successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'Log entry not found' })
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteTea(@Param('id') id: string, @Request() req): Promise<void> {
    await this.brewLogService.remove(id, req.user.sub);
  }
}
