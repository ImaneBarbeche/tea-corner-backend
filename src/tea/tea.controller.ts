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
  ForbiddenException,
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

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get public tea shared by users' })
  @Get('/public')
  @UseGuards(AuthGuard)
  async findPublicTea(): Promise<Tea[]> {
    return this.teaService.findPublicTeas();
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get tea by ID' })
  @Get(':id')
  @UseGuards(AuthGuard)
  async findTeaById(@Param('id') id: string): Promise<Tea> {
    const tea = await this.teaService.findOne(id);

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
    createTeaDto.author_id = req.user.sub;
    console.log(createTeaDto.author_id);
    return this.teaService.create(createTeaDto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a tea' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteTea(@Param('id') id: string, @Request() req): Promise<void> {
    const tea = await this.teaService.findOne(id);

    if (!tea) {
      throw new NotFoundException(`Tea with ID ${id} not found`);
    }

    // system tea can only be deleted by admins
    if (!tea.author && req.user.role !== Role.Admin) {
      throw new ForbiddenException('system tea can only be deleted by admins');
    }

    // Users can only delete their proper tea
    if (
      tea.author &&
      tea.author.id !== req.user.id &&
      req.user.role !== Role.Admin
    ) {
      throw new ForbiddenException('You can only delete your own teas');
    }

    await this.teaService.remove(id);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Add an ingredient to a tea' })
  @Post(':teaId/ingredients')
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
  @ApiOperation({ summary: 'Remove an ingredient from a tea' })
  @Delete(':teaId/ingredients/:id')
  @UseGuards(AuthGuard)
  async removeIngredient(
    @Param('id') id: string,
  ): Promise<void> {
    return this.teaService.removeIngredient(id);
  }
}
