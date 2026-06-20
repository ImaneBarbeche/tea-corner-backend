import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BrewLog } from './brew-log.entity';
import { Repository } from 'typeorm';
import { CreateBrewLogDto } from './create-brew-log.dto';
import { UpdateBrewLogDto } from './update-brew-log.dto';

@Injectable()
export class BrewLogService {
  constructor(
    @InjectRepository(BrewLog)
    private brewLogRepository: Repository<BrewLog>,
  ) {}

  // admin
  async findAll(): Promise<BrewLog[]> {
    return await this.brewLogRepository.find();
  }

  async findPublicBrewLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<BrewLog[]> {
    return this.brewLogRepository.find({
      where: {
        is_public: true,
      },
      relations: ['tea', 'tea.style', 'tea.author', 'user'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });
  }

  async findUserBrewLogs(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<BrewLog[]> {
    const userLogs = await this.brewLogRepository.find({
      where: { user: { id: userId } },
      relations: ['tea', 'tea.style', 'tea.author'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    if (!userLogs) {
      throw new NotFoundException(`No logs were found for this user`);
    }

    return userLogs;
  }

  async create(dto: CreateBrewLogDto): Promise<BrewLog> {
    const log = this.brewLogRepository.create({
      ...dto,
      tea: { id: dto.tea_id },
    });
    return await this.brewLogRepository.save(log);
  }

  // async update(
  //   id: string,
  //   dto: UpdateBrewLogDto,
  //   userId: string,
  // ): Promise<BrewLog> {
  //   const brewLog = await this.brewLogRepository.findOne(
  //     {
  //       where: { id: }
  //     }
  //   )
  // }
}

// For the brew logs
// Admin: find all ✅
// find all public ones (by all users, for the discovery page) (remember to add a limit) ✅
// find all by user (personal entries) ✅
// Find one? Only in case we add a system where you can comment etc where it would help to be able to show just one log.
// add one ✅
// Update one
// Delete one
