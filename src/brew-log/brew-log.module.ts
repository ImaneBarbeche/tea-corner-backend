import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrewLogController } from './brew-log.controller';
import { BrewLogService } from './brew-log.service';
import { BrewLog } from './brew-log.entity';
import { AuthModule } from '../auth/auth.module';
import { TeaModule } from '../tea/tea.module';
import { BrewLogTaste } from './brew-log-taste.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BrewLog, BrewLogTaste]),
    forwardRef(() => AuthModule),
    TeaModule,
  ],
  controllers: [BrewLogController],
  providers: [BrewLogService],
  exports: [TypeOrmModule],
})
export class BrewLogModule {}
