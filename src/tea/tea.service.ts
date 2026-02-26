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
import { UpdateTeaDto } from './update-tea.dto';
import { TeaStyleService } from '../tea-style/tea-style.service';
import { UpdateTeaIngredientDto } from './update-tea-ingredient.dto';

@Injectable()
export class TeaService {
  constructor(
    @InjectRepository(Tea)
    private teaRepository: Repository<Tea>,
    @InjectRepository(TeaIngredient)
    private teaIngredientRepository: Repository<TeaIngredient>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    private teaStyleService: TeaStyleService,
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

  // returns community teas (not system ones)
  async findPublicTeas(): Promise<Tea[]> {
    return this.teaRepository.find({
      where: { is_public: true, author: Not(IsNull()) },
      relations: ['style', 'author'],
    });
  }

  async findOne(id: string, userId?: string): Promise<Tea | null> {
    const tea = await this.teaRepository.findOne({
      where: { id },
      relations: ['style', 'author', 'ingredients', 'ingredients.ingredient'],
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

  async remove(id: string): Promise<void> {
    await this.teaRepository.softDelete(id);
  }

  async create(createTeaDto: CreateTeaDto): Promise<Tea> {
    const tea = this.teaRepository.create(createTeaDto);

    if (createTeaDto.style_id) {
      const style = await this.teaStyleService.findOne(createTeaDto.style_id);

      if (!style) {
        throw new NotFoundException(
          `style with ID ${createTeaDto.style_id} not found`,
        );
      }
    }

    return await this.teaRepository.save(tea);
  }

  async update(
    id: string,
    updateTeaDto: UpdateTeaDto,
    userId: string,
  ): Promise<Tea> {
    const tea = await this.findOne(id, userId);

    if (!tea?.author) {
      throw new ForbiddenException('System teas can only be updated by admins');
    }

    Object.assign(tea, updateTeaDto);

    return await this.teaRepository.save(tea);
  }

  // is called after a tea is created (handled in the front)
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

  // in case we want to get ingredients separately from the tea or if we want to only refresh ingredients and not the whole tea page
  async getIngredients(teaId: string): Promise<TeaIngredient[]> {
    return this.teaIngredientRepository.find({
      where: { tea: { id: teaId } },
      relations: ['ingredient'],
    });
  }

  async updateIngredient(
    teaIngredientId: string,
    dto: UpdateTeaIngredientDto,
  ): Promise<TeaIngredient> {
    const teaIngredient = await this.teaIngredientRepository.findOne({
      where: { id: teaIngredientId },
    });
    if (!teaIngredient) {
      throw new NotFoundException(
        `TeaIngredient with ID ${teaIngredientId} not found`,
      );
    }
    teaIngredient.quantity = dto.quantity;
    return this.teaIngredientRepository.save(teaIngredient);
  }

  async removeIngredient(teaIngredientId: string): Promise<void> {
    const teaIngredient = await this.teaIngredientRepository.findOne({
      where: { id: teaIngredientId },
    });

    if (!teaIngredient) {
      throw new NotFoundException(
        `TeaIngredient with ID ${teaIngredientId} not found`,
      );
    }
    await this.teaIngredientRepository.delete(teaIngredientId);
  }
}
