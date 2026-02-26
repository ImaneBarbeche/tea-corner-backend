import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlavourType } from './flavour-type.entity';
import { FlavourTypeService } from './flavour-type.service';
import { FlavourTypeController } from './flavour-type.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlavourType]), AuthModule],
  providers: [FlavourTypeService],
  controllers: [FlavourTypeController],
  exports: [FlavourTypeService]
})
export class FlavourTypeModule {}
