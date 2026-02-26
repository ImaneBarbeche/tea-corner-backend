import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/user.entity';
import { Role } from './enums/role.enum';
import { Status } from './enums/status.enum';
import * as argon2 from 'argon2';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const existing = await this.userRepository.findOne({
      where: { role: Role.Admin },
    });

    if (existing) {
      this.logger.log('Admin already exists, skipping seed');
      return;
    }

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME;
    const displayName = process.env.ADMIN_DISPLAY_NAME;

    if (!email || !password || !username || !displayName) {
      this.logger.warn('Admin env vars not set (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, ADMIN_DISPLAY_NAME), skipping admin seed');
      return;
    }

    const hashedPassword = await argon2.hash(password);

    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      user_name: username,
      display_name: displayName,
      role: Role.Admin,
      email_verified: true,
      status: Status.ACTIVE,
    });

    await this.userRepository.save(admin);
    this.logger.log(`Admin created: ${email}`);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
