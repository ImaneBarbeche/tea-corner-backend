import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FlavourTypeService } from './flavour-type.service';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlavourType } from './flavour-type.entity';

@Controller('flavour-type')
export class FlavourTypeController {
  constructor(private flavourTypeService: FlavourTypeService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all flavour types)' })
  @ApiResponse({ status: 200, description: 'List of flavour types' })
  @ApiResponse({ status: 404, description: 'No flavour types found' })
  @Get('/all')
  @UseGuards(AuthGuard)
  async findAllFlavourTypes(): Promise<FlavourType[]> {
    return this.flavourTypeService.findAll();
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get flavour types by ID' })
  @ApiResponse({ status: 200, description: 'Flavour type found' })
  @ApiResponse({ status: 404, description: 'Flavour type not found' })
  @Get(':id')
  @UseGuards(AuthGuard)
  async findById(@Param('id') id: string): Promise<FlavourType> {
    return this.flavourTypeService.findOne(id);
  }
}
