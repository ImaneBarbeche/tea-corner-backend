import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlavourProfile } from './flavour-profile.entity';
import { FlavourProfileService } from './flavour-profile.service';
import { FlavourProfileController } from './flavour-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlavourProfile])],
  providers: [FlavourProfileService],
  controllers: [FlavourProfileController],
})
export class FlavourProfileModule {}
