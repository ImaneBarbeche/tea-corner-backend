import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FlavourProfileService } from './flavour-profile.service';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { FlavourProfile } from './flavour-profile.entity';

@Controller('flavour-profile')
export class FlavourProfileController {
  constructor(private flavourProfileService: FlavourProfileService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all flavour profiles)' })
  @ApiResponse({ status: 200, description: 'List of flavour profiles' })
  @ApiResponse({ status: 404, description: 'No flavour profile found' })
  @Get('/all')
  @UseGuards(AuthGuard)
  async findAllFlavourProfiles(): Promise<FlavourProfile[]> {
    return this.flavourProfileService.findAll();
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
