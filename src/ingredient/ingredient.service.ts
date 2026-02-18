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
import { Role } from 'src/enums/role.enum';
import { UpdateIngredientDto } from './update-ingredient.dto';
@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  // return all ingredients that were not deleted (with pagination to prevent too much data at once)
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Ingredient[]; total: number }> {
    const [data, total] = await this.ingredientRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total };
  }

  //   ingredients added by the admin (user is null)
  async findSystemIngredient(): Promise<Ingredient[]> {
    return this.ingredientRepository.find({
      where: { user: IsNull() },
      relations: ['user'],
    });
  }

  //   ingredients created by a user
  async findUserIngredients(): Promise<Ingredient[]> {
    return this.ingredientRepository.find({
      where: { user: Not(IsNull()) },
      relations: ['user'],
    });
  }

  //   find an ingredient by ID
  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with Id ${id} not found`);
    }
    return ingredient;
  }

  //   delete an ingredient
  async remove(id: string, userId: string, userRole: Role): Promise<void> {
    const ingredient = await this.findOne(id);

    if (ingredient.user?.id !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException('You can only delete your own ingredients');
    }

    await this.ingredientRepository.softDelete(id);
  }

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    return await this.ingredientRepository.save(ingredient);
  }
  // ingredient.service.ts

  async update(
    id: string,
    updateData: UpdateIngredientDto,
    userId: string,
    userRole: Role,
  ): Promise<Ingredient> {
    const ingredient = await this.findOne(id);

    // only admin can update ingredient system
    if (!ingredient.user && userRole !== Role.Admin) {
      throw new ForbiddenException('Only admins can modify system ingredients');
    }

    // a user can update only his own ingredients
    if (
      ingredient.user &&
      ingredient.user.id !== userId &&
      userRole !== Role.Admin
    ) {
      throw new ForbiddenException('You can only modify your own ingredients');
    }

    Object.assign(ingredient, updateData);
    return await this.ingredientRepository.save(ingredient);
  }
}
