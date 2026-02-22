import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientService } from './ingredient.service';
import { IngredientController } from './ingredient.controller';
import { Ingredient } from './ingredient.entity';
import { AuthModule } from '../auth/auth.module';
import { TeaIngredient } from './tea-ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient, TeaIngredient]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, IngredientService],
  providers: [IngredientService],
  controllers: [IngredientController],
})
export class IngredientModule {}
