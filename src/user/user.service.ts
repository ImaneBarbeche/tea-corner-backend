import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { UpdateUsernameDto } from './update-username.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ user_name: username });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    return await this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    console.log(user);
    return await this.userRepository.save(user);
  }

  async updateUserName(id: string, newUsername: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingUser = await this.userRepository.findOneBy({
      user_name: newUsername,
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new ConflictException('username already exists');
    }

    // Allow for updating the username only up to once a month
    const COOLDOWN_DAYS = 30;
    if (user.username_last_changed) {
      const daysSinceChange =
        (Date.now() - user.username_last_changed.getTime()) /
        (1000 * 60 * 60 * 24);

      if (daysSinceChange < COOLDOWN_DAYS) {
        const daysRemaining = Math.ceil(COOLDOWN_DAYS - daysSinceChange);
        throw new BadRequestException(
          `You can change your username again in ${daysRemaining} days`,
        );
      }
    }

    user.user_name = newUsername;
    return await this.userRepository.save(user);
  }
}
