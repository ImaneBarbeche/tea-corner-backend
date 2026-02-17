import { InjectRepository } from '@nestjs/typeorm';
import { Tea } from './tea.entity';
import { IsNull, Not, Repository } from 'typeorm';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeaDto } from './create-tea.dto';
import { UpdateTeaDto } from './update-tea.dto';

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
    await this.teaRepository.softDelete(id);
  }

  async create(createTeaDto: CreateTeaDto): Promise<Tea> {
    const tea = this.teaRepository.create(createTeaDto);

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

  // async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  //   const user = await this.userRepository.findOneBy({ id: id });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   Object.assign(user, updateUserDto);

  //   console.log(user);
  //   return await this.userRepository.save(user);
  // }
}
