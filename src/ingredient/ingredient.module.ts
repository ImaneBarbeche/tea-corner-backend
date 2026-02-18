import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientService } from './ingredient.service';
import { IngredientController } from './ingredient.controller';
import { Ingredient } from './ingredient.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, IngredientService],
  providers: [IngredientService],
  controllers: [IngredientController],
})
export class IngredientModule {}
