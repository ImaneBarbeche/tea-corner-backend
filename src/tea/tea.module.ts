import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeaService } from './tea.service';
import { TeaController } from './tea.controller';
import { Tea } from './tea.entity';
import { AuthModule } from '../auth/auth.module';
import { TeaIngredient } from '../ingredient/tea-ingredient.entity';
import { TeaFlavourProfile } from '../flavour-profile/tea-flavour-profile.entity';
import { Ingredient } from '../ingredient/ingredient.entity';

import { TeaStyleService } from '../tea-style/tea-style.service';
import { TeaStyle } from '../tea-style/tea-style.entity';
import { FlavourProfile } from '../flavour-profile/flavour-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tea,
      TeaIngredient,
      Ingredient,
      TeaStyle,
      TeaFlavourProfile,
      FlavourProfile,
    ]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, TeaService],
  providers: [TeaService, TeaStyleService],
  controllers: [TeaController],
})
export class TeaModule {}
