import { InjectRepository } from '@nestjs/typeorm';
import { Tea } from './tea.entity';
import { IsNull, Not, Repository } from 'typeorm';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeaDto } from './create-tea.dto';
import { AddIngredientDto } from './add-ingredient.dto';
import { TeaIngredient } from '../ingredient/tea-ingredient.entity';
import { Ingredient } from '../ingredient/ingredient.entity';

@Injectable()
export class TeaService {
  constructor(
    @InjectRepository(Tea)
    private teaRepository: Repository<Tea>,
    @InjectRepository(TeaIngredient)
    private teaIngredientRepository: Repository<TeaIngredient>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  // admin
  async findAll(): Promise<Tea[]> {
    return await this.teaRepository.find();
  }

  async findSystemTeas(): Promise<Tea[]> {
    return this.teaRepository.find({
      where: { author: IsNull() },
      relations: ['style'],
    });
  }

  async findPublicTeas(): Promise<Tea[]> {
    return this.teaRepository.find({
      where: { is_public: true, author: Not(IsNull()) },
      relations: ['style', 'author'],
    });
  }

  async findOne(id: string, userId?: string): Promise<Tea | null> {
    const tea = await this.teaRepository.findOne({
      where: { id },
      relations: [
        'style',
        'author',
        'teaIngredients',
        'teaIngredients.ingredient',
      ],
    });

    if (!tea) {
      throw new NotFoundException(`Tea with ID ${id} not found`);
    }

    // Check access permissions
    const isSystemTea = !tea.author;
    const isOwnTea = tea.author && userId && tea.author.id === userId;
    const isPublicTea = tea.is_public;

    if (!isSystemTea && !isOwnTea && !isPublicTea) {
      throw new ForbiddenException('This tea is private');
    }

    return tea;
  }

  // TODO: think of how it affects queries
  async remove(id: string): Promise<void> {
    await this.teaRepository.softDelete(id);
  }

  async create(createTeaDto: CreateTeaDto): Promise<Tea> {
    const tea = this.teaRepository.create(createTeaDto);
    return await this.teaRepository.save(tea);
  }

  async addIngredient(
    teaId: string,
    dto: AddIngredientDto,
  ): Promise<TeaIngredient> {
    const tea = await this.teaRepository.findOne({ where: { id: teaId } });
    if (!tea) throw new NotFoundException(`Tea ${teaId} not found`);

    const ingredient = await this.ingredientRepository.findOne({
      where: { id: dto.ingredientId },
    });

    if (!ingredient)
      throw new NotFoundException(`Ingredient ${dto.ingredientId} not found`);

    const existing = await this.teaIngredientRepository.findOne({
      where: { tea: { id: teaId }, ingredient: { id: dto.ingredientId } },
    });
    if (existing) {
      throw new ConflictException('This ingredient is already in this tea');
    }

    const teaIngredient = this.teaIngredientRepository.create({
      tea: { id: teaId },
      ingredient: { id: dto.ingredientId },
      quantity: dto.quantity,
      optional: dto.optional ?? false,
    });
    return this.teaIngredientRepository.save(teaIngredient);
  }

  // in case we want to get ingredients separately from the tea or if we want to onl refresh ingredients and not the whole tea page
  async getIngredients(teaId: string): Promise<TeaIngredient[]> {
    return this.teaIngredientRepository.find({
      where: { tea: { id: teaId } },
      relations: ['ingredient'],
    });
  }

  async removeIngredient(teaIngredientId: string): Promise<void> {
    await this.teaIngredientRepository.delete(teaIngredientId);
  }
}
