import { Ingredient } from './ingredient.entity';
import { IsNull, Not, Repository } from 'typeorm';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIngredientDto } from './create-ingredient.dto';
import { User } from '../user/user.entity';
@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  async findAll(): Promise<Ingredient[]> {
    return await this.ingredientRepository.find();
  }

  async findOne(id: string): Promise<Ingredient | null> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!ingredient) {
      throw new NotFoundException(`Tea with Id ${id} not found`);
    }
    return ingredient;
  }

  async remove(id: string): Promise<void> {
    await this.ingredientRepository.softDelete(id);
  }

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    return await this.ingredientRepository.save(ingredient);
  }
}
