import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeaService } from './tea.service';
import { TeaController } from './tea.controller';
import { Tea } from './tea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tea])],
  exports: [TypeOrmModule, TeaService],
  providers: [TeaService],
  controllers: [TeaController],
})
export class TeaModule {}
