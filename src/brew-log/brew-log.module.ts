import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrewLogController } from './brew-log.controller';
import { BrewLogService } from './brew-log.service';
import { BrewLog } from './brew-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BrewLog])],
  controllers: [BrewLogController],
  providers: [BrewLogService],
  exports: [TypeOrmModule],
})
export class BrewLogModule {}
