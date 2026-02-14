import { InjectRepository } from '@nestjs/typeorm';
import { Tea } from './tea.entity';
import { IsNull, Not, Repository } from 'typeorm';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createTeaDto } from './create-tea.dto';

@Injectable()
export class TeaService {
  constructor(
    @InjectRepository(Tea)
    private teaRepository: Repository<Tea>,
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
      relations: ['style', 'author'],
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
    await this.teaRepository.delete(id);
  }

  async create(createTeaDto: createTeaDto): Promise<Tea> {
    const tea = this.teaRepository.create(createTeaDto);

    return await this.teaRepository.save(tea);
  }
}
