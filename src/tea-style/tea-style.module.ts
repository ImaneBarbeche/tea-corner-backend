import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeaStyleService } from './tea-style.service';
import { TeaStyleController } from './tea-style.controller';
import { TeaStyle } from './tea-style.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeaStyle])],
  exports: [TypeOrmModule, TeaStyleService],
  providers: [TeaStyleService],
  controllers: [TeaStyleController],
})
export class TeaStyleModule {}
