import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { TeaStyle } from './tea-style.entity';
import { TeaStyleService } from './tea-style.service';

@Controller('tea-style')
export class TeaStyleController {
  constructor(private teaStyleService: TeaStyleService) {}

  @ApiOperation({ summary: 'Get all tea styles' })
  @ApiResponse({
    status: 200,
    description: 'List of all tea styles returned successfully',
  })
  @ApiResponse({ status: 404, description: 'No tea styles found' })
  @Get('/all')
  async findAllTeaStyles(): Promise<TeaStyle[] | null> {
    const teaStyle = await this.teaStyleService.findAll();

    if (!teaStyle) {
      throw new NotFoundException(`No tea styles were found`);
    }

    return teaStyle;
  }

  @ApiOperation({ summary: 'Get a tea style by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the tea style',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Tea style returned successfully' })
  @ApiResponse({ status: 404, description: 'Tea style not found' })
  @Get(':id')
  async findTeaStyleById(@Param('id') id: string): Promise<TeaStyle> {
    const teaStyle = await this.teaStyleService.findOne(id);

    if (!teaStyle) {
      throw new NotFoundException(`Tea style with ID ${id} could not be found`);
    }

    return teaStyle;
  }
}
