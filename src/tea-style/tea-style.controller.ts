import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { TeaStyle } from './tea-style.entity';
import { TeaStyleService } from './tea-style.service';

@Controller('tea-style')
export class TeaStyleController {
  constructor(private teaStyleService: TeaStyleService) {}

  @ApiOperation({
    summary: 'Get all tea styles',
  })
  @Get('/all')
  async findAllTeaStyles(): Promise<TeaStyle[] | null> {
    const teaStyle = await this.teaStyleService.findAll();

    if (!teaStyle) {
      throw new NotFoundException(`No tea styles were found`);
    }

    return teaStyle;
  }

  @ApiOperation({ summary: 'Get tea by ID' })
  @Get(':id')
  async findTeaStyleById(@Param('id') id: string): Promise<TeaStyle> {
    const teaStyle = await this.teaStyleService.findOne(id);

    if (!teaStyle) {
      throw new NotFoundException(`Tea style with ID ${id} could not be found`);
    }

    return teaStyle;
  }
}
