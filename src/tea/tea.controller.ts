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
} from '@nestjs/common';
import { TeaService } from './tea.service';
import { Tea } from './tea.entity';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { CreateTeaDto } from './create-tea.dto';
import { AddIngredientDto } from './add-ingredient.dto';
import { TeaIngredient } from '../ingredient/tea-ingredient.entity';
import { UpdateTeaDto } from './update-tea.dto';
import { UpdateTeaIngredientDto } from './update-tea-ingredient.dto';

@Controller('tea')
export class TeaController {
  constructor(private teaService: TeaService) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get all tea (both system and user tea) (admin only)',
  })
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

  @ApiOperation({ summary: 'Get only system teas' })
  @Get('/system')
  async findSystemTeas(): Promise<Tea[]> {
    return this.teaService.findSystemTeas();
  }

  @ApiOperation({ summary: 'Get the daily tea suggestion' })
  @Get('/daily')
  async getDailyTea(): Promise<Tea> {
    return this.teaService.getDailyTea();
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get public tea shared by users' })
  @Get('/public')
  @UseGuards(AuthGuard)
  async findPublicTea(): Promise<Tea[]> {
    return this.teaService.findPublicTeas();
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get tea by ID' })
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
  @ApiOperation({ summary: 'Create new tea' })
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
  @Get(':teaId/ingredients')
  @UseGuards(AuthGuard)
  async getIngredients(
    @Param('teaId') teaId: string,
  ): Promise<TeaIngredient[]> {
    return this.teaService.getIngredients(teaId);
  }
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update the quantity of an ingredient in a tea' })
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
  @Delete(':teaId/ingredients/:id')
  @UseGuards(AuthGuard)
  async removeIngredient(@Param('id') id: string): Promise<void> {
    return this.teaService.removeIngredient(id);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a tea' })
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
