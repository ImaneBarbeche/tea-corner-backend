import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  Request,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Query,
} from '@nestjs/common';
import { TeaService } from './tea.service';
import { Tea } from './tea.entity';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateTeaDto } from './create-tea.dto';
import { AddIngredientDto } from './add-ingredient.dto';
import { TeaIngredient } from '../ingredient/tea-ingredient.entity';
import { UpdateTeaDto } from './update-tea.dto';
import { UpdateTeaIngredientDto } from './update-tea-ingredient.dto';
import { Public } from '../decorators/auth.decorator';
import { TeaType } from '../enums/teaType.enum';

@Controller('tea')
export class TeaController {
  constructor(private teaService: TeaService) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get all teas — system and user-created (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all teas returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  @Get('/all')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAllTeas(): Promise<Tea[] | null> {
    const tea = await this.teaService.findAll();

    if (!tea) {
      throw new NotFoundException(`No tea was found`);
    }

    return tea;
  }

  @ApiOperation({ summary: 'Get system teas (public)' })
  @ApiResponse({
    status: 200,
    description: 'List of system teas returned successfully',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: TeaType })
  @Get('/system')
  @Public()
  async findSystemTeas(
    @Query('search') search?: string,
    @Query('type') type?: TeaType,
  ): Promise<Tea[]> {
    return this.teaService.findSystemTeas(search, type);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get the daily tea suggestion' })
  @ApiResponse({
    status: 200,
    description: 'Daily tea suggestion returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @Get('/daily')
  async getDailyTea(): Promise<Tea> {
    return this.teaService.getDailyTea();
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get public teas shared by users' })
  @ApiResponse({
    status: 200,
    description: 'List of public user-created teas returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: TeaType })
  @Get('/public')
  @UseGuards(AuthGuard)
  async findPublicTea(
    @Query('search') search?: string,
    @Query('type') type?: TeaType,
  ): Promise<Tea[]> {
    return this.teaService.findPublicTeas(search, type);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get tea by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the tea',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Tea returned successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'Tea not found' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @UseGuards(AuthGuard)
  async findTeaById(@Param('id') id: string, @Request() req): Promise<Tea> {
    const tea = await this.teaService.findOne(id, req.user.sub);

    if (!tea) {
      throw new NotFoundException(`Tea with ID ${id} could not be found`);
    }

    return tea;
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new tea' })
  @ApiResponse({ status: 201, description: 'Tea created successfully' })
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
    @Body() createTeaDto: CreateTeaDto,
    @Request() req,
  ): Promise<Tea> {
    const teaData = {
      ...createTeaDto,
      author: { id: req.user.sub },
      style: createTeaDto.style_id ? { id: createTeaDto.style_id } : undefined,
    };

    return this.teaService.create(teaData);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a tea' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the tea to delete',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Tea deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'Tea not found' })
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteTea(@Param('id') id: string, @Request() req): Promise<void> {
    const tea = await this.teaService.findOne(id, req.user.sub);

    if (!tea) {
      throw new NotFoundException(`Tea with ID ${id} could not be found`);
    }

    await this.teaService.remove(id);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Add an ingredient to a tea' })
  @ApiParam({
    name: 'teaId',
    description: 'UUID of the tea',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 201,
    description: 'Ingredient added to tea successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @Post(':teaId/ingredient')
  @UseGuards(AuthGuard)
  async addIngredient(
    @Param('teaId') teaId: string,
    @Body() dto: AddIngredientDto,
  ): Promise<TeaIngredient> {
    return this.teaService.addIngredient(teaId, dto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all ingredients of a tea' })
  @ApiParam({
    name: 'teaId',
    description: 'UUID of the tea',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Tea ingredients returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @Get(':teaId/ingredients')
  @UseGuards(AuthGuard)
  async getIngredients(
    @Param('teaId') teaId: string,
  ): Promise<TeaIngredient[]> {
    return this.teaService.getIngredients(teaId);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update the quantity of an ingredient in a tea' })
  @ApiParam({
    name: 'teaId',
    description: 'UUID of the tea',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the tea-ingredient entry',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingredient quantity updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid quantity',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @Patch(':teaId/ingredients/:id')
  @UseGuards(AuthGuard)
  async updateIngredient(
    @Param('id') id: string,
    @Body() dto: UpdateTeaIngredientDto,
  ): Promise<TeaIngredient> {
    return this.teaService.updateIngredient(id, dto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Remove an ingredient from a tea' })
  @ApiParam({
    name: 'teaId',
    description: 'UUID of the tea',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the tea-ingredient entry to remove',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingredient removed from tea successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'Tea-ingredient entry not found' })
  @Delete(':teaId/ingredients/:id')
  @UseGuards(AuthGuard)
  async removeIngredient(@Param('id') id: string): Promise<void> {
    return this.teaService.removeIngredient(id);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a tea' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the tea to update',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Tea updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing or invalid session',
  })
  @ApiResponse({ status: 404, description: 'Tea not found' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async updateTea(
    @Param('id') id: string,
    @Body() updateTeaDto: UpdateTeaDto,
    @Request() req,
  ): Promise<Tea> {
    return await this.teaService.update(id, updateTeaDto, req.user.sub);
  }
}
