import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTea } from './user-tea.entity';
import { Repository } from 'typeorm';
import { CreateUserTeaDto } from './create-user-tea.dto';
import { UpdateUserTeaDto } from './update-user-tea.dto';
import { TeaService } from 'src/tea/tea.service';

@Injectable()
export class UserTeaService {
  constructor(
    @InjectRepository(UserTea)
    private userTeaRepository: Repository<UserTea>,
    private teaService: TeaService,
  ) {}

  // admin
  async findAll(): Promise<UserTea[]> {
    return await this.userTeaRepository.find();
  }

  // get all teas that have been added to a user library (system, public, and their own creations)
  async findUserLibrary(userId: string): Promise<UserTea[]> {
    const userTeas = await this.userTeaRepository.find({
      where: { user: { id: userId } },
      relations: ['tea', 'tea.style', 'tea.author'],
      order: { created_at: 'DESC' },
    });

    if (!userTeas) {
      throw new NotFoundException(`No tea was found`);
    }

    return userTeas;
  }

  async findOne(id: string, userId: string): Promise<UserTea> {
    const userTea = await this.userTeaRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['tea', 'tea.style', 'tea.author'],
    });

    if (!userTea) {
      throw new NotFoundException(`Tea with ID ${id} could not be found`);
    }

    return userTea;
  }

  async create(dto: CreateUserTeaDto, userId): Promise<UserTea> {
    const existingUserTea = await this.userTeaRepository.findOne({
      where: {
        user: { id: userId },
        tea: { id: dto.tea_id },
      },
    });

    if (existingUserTea) {
      throw new BadRequestException('This tea is already in your library');
    }

    // checking whether the tea exists and whether the user has access to it
    const tea = await this.teaService.findOne(dto.tea_id, userId);

    if (!tea) {
      throw new NotFoundException(`tea with ID ${dto.tea_id} not found`);
    }

    const userTea = this.userTeaRepository.create({
      ...dto,
      tea: { id: dto.tea_id },
    });

    return await this.userTeaRepository.save(userTea);
  }

  async update(
    id: string,
    dto: UpdateUserTeaDto,
    userId: string,
  ): Promise<UserTea> {
    const userTea = await this.findOne(id, userId);
    Object.assign(userTea, dto);

    return await this.userTeaRepository.save(userTea);
  }

  async remove(id: string): Promise<void> {
    await this.userTeaRepository.softDelete(id);
  }
}
