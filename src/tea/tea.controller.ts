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
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { CreateTeaDto } from './create-tea.dto';

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
}
