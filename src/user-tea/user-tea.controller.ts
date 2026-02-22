import {
  Controller,
  Delete,
  NotFoundException,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserTeaService } from './user-tea.service';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('user-tea')
export class UserTeaController {
  constructor(private userTeaService: UserTeaService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a tea' })
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteTea(@Param('id') id: string, @Request() req): Promise<void> {
    const tea = await this.userTeaService.findOne(id, req.user.sub);

    if (!tea) {
      throw new NotFoundException(`Tea with ID ${id} could not be found`);
    }

    await this.userTeaService.remove(id);
  }
}
