import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTea } from './user-tea.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserTeaService {
  constructor(
    @InjectRepository(UserTea)
    private userTeaRepository: Repository<UserTea>,
  ) {}

  // admin
  async findAll(): Promise<UserTea[]> {
    return await this.userTeaRepository.find();
  }

  // get all teas that have been added to a user library (system, public, and their own creations)
  async findUserLibrary(userId: string): Promise<UserTea[]> {
    return await this.userTeaRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'tea', 'tea.style'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<UserTea> {
    const item = await this.userTeaRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['tea', 'tea.style'],
    });

    if (!item) {
      throw new NotFoundException('Collection item not found');
    }

    return item;
  }

  async remove(id: string): Promise<void> {
    await this.userTeaRepository.softDelete(id);
  }
}
