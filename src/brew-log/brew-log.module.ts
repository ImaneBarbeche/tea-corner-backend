import { Module } from '@nestjs/common';
import { BrewLogController } from './brew-log.controller';
import { BrewLogService } from './brew-log.service';

@Module({
  controllers: [BrewLogController],
  providers: [BrewLogService]
})
export class BrewLogModule {}
