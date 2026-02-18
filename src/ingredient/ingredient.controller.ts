import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Delete,
  Query,
  ParseIntPipe,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './create-ingredient.dto';
import { Ingredient } from './ingredient.entity';
import { UpdateIngredientDto } from './update-ingredient.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Controller('ingredient')
export class IngredientController {
  constructor(private ingredientService: IngredientService) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get all ingredients (admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of ingredients with pagination',
  })
  @ApiResponse({ status: 404, description: 'No ingredients found' })
  @Get('/admin/all')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<{ data: Ingredient[]; total: number }> {
    return this.ingredientService.findAll(page, limit);
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get all ingredients (system + created by logged user)',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of ingredients from the system and created by the authentified user',
  })
  @ApiResponse({ status: 404, description: 'No ingredients found' })
  @Get('all')
  @UseGuards(AuthGuard)
  async findAllForUser(@Request() req): Promise<Ingredient[]> {
    const ingredients = await this.ingredientService.findAllForUser(
      req.user.sub,
    );
    return ingredients;
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get ingredient by ID' })
  @ApiResponse({ status: 200, description: 'Ingredient found' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @UseGuards(AuthGuard)
  async findIngredientById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Ingredient> {
    return this.ingredientService.findOne(id, req.user.sub);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create new ingredient' })
  @ApiResponse({ status: 201, description: 'Ingredient created' })
  @Post('/create')
  @UseGuards(AuthGuard)
  async createIngredient(
    @Body() createIngredientDto: CreateIngredientDto,
    @Request() req,
  ): Promise<Ingredient> {
    const ingredientData = {
      ...createIngredientDto,
      user: { id: req.user.sub },
    };
    return this.ingredientService.create(ingredientData);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete an ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden (not your ingredient)' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteIngredient(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    await this.ingredientService.remove(id, req.user.sub, req.user.role);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update an ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient updated' })
  @ApiResponse({ status: 403, description: 'Forbidden (not your ingredient)' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateIngredient(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @Request() req,
  ): Promise<Ingredient> {
    return this.ingredientService.update(
      id,
      updateIngredientDto,
      req.user.sub,
      req.user.role,
    );
  }
}
