import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeaService } from './tea.service';
import { TeaController } from './tea.controller';
import { Tea } from './tea.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tea]), forwardRef(() => AuthModule)],
  exports: [TypeOrmModule, TeaService],
  providers: [TeaService],
  controllers: [TeaController],
})
export class TeaModule {}
