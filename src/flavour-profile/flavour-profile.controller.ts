import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FlavourProfileService } from './flavour-profile.service';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { FlavourProfile } from './flavour-profile.entity';

@Controller('flavour-profile')
export class FlavourProfileController {
  constructor(private flavourProfileService: FlavourProfileService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all flavour profiles)' })
  @ApiResponse({ status: 200, description: 'List of flavour profiles' })
  @ApiResponse({ status: 404, description: 'No flavour profile found' })
  @ApiQuery({ name: 'flavourTypeId', required: false })
  @Get('/all')
  @UseGuards(AuthGuard)
  async findAllFlavourProfiles(
    @Query('flavourTypeId') flavourTypeId?: string,
  ): Promise<FlavourProfile[]> {
    return this.flavourProfileService.findAll(flavourTypeId);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get flavour profiles by ID' })
  @ApiResponse({ status: 200, description: 'Flavour profile found' })
  @ApiResponse({ status: 404, description: 'Flavour profile not found' })
  @Get(':id')
  @UseGuards(AuthGuard)
  async findById(@Param('id') id: string): Promise<FlavourProfile> {
    return this.flavourProfileService.findOne(id);
  }
}
