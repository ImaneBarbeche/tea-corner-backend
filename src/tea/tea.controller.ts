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
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
} from '@nestjs/common';
import { TeaService } from './tea.service';
import { Tea } from './tea.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { CreateTeaDto } from './create-tea.dto';
import { UpdateTeaDto } from './update-tea.dto';

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
