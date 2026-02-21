import { Ingredient } from './ingredient.entity';
import { IsNull, Repository } from 'typeorm';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIngredientDto } from './create-ingredient.dto';
import { Role } from '../enums/role.enum';
import { UpdateIngredientDto } from './update-ingredient.dto';
@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  // admin return all ingredients that were not deleted (with pagination to prevent too much data at once)
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

  // find ingredients if user null or user created them
  async findAllForUser(userId: string): Promise<Ingredient[]> {
    return this.ingredientRepository.find({
      where: [{ user: { id: userId } }, { user: IsNull() }],
      relations: ['user'],
    });
  }

  //   find an ingredient by ID
  async findOne(id: string, userId: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with Id ${id} not found`);
    }

    const isSystemIngredient = !ingredient.user;
    const isOwnIngredient =
      ingredient.user && userId && ingredient.user.id === userId;

    if (!isSystemIngredient && !isOwnIngredient) {
      throw new ForbiddenException('This ingredient is private');
    }

    return ingredient;
  }

  //   delete an ingredient
  async remove(id: string, userId: string, userRole: Role): Promise<void> {
    const ingredient = await this.findOne(id, userId);

    if (ingredient.user?.id !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException('You can only delete your own ingredients');
    }

    await this.ingredientRepository.softDelete(id);
  }

  async create( dto: CreateIngredientDto, userId: string) {
    const existing = await this.ingredientRepository.findOne({
      where: {
      user: { id: userId }, 
      name: dto.name,   
    },
    });
    if (existing) {
      throw new ConflictException(
        `Vous avez déjà un ingrédient nommé "${dto.name}"`,
      );
    }

    return await this.ingredientRepository.save(dto);
  }

  // update ingredients only if user created them
  async update(
    id: string,
    updateData: UpdateIngredientDto,
    userId: string,
    userRole: Role,
  ): Promise<Ingredient> {
    const ingredient = await this.findOne(id, userId);

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
