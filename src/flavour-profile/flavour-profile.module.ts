import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlavourProfile } from './flavour-profile.entity';
import { FlavourProfileService } from './flavour-profile.service';
import { FlavourProfileController } from './flavour-profile.controller';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [TypeOrmModule.forFeature([FlavourProfile]), AuthModule],
  providers: [FlavourProfileService],
  controllers: [FlavourProfileController],
})
export class FlavourProfileModule {}
