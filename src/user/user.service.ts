import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { UpdateEmailDto } from './update-email.dto';
import { UpdatePasswordDto } from './update-password.dto';
import * as argon2 from 'argon2';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { EmailService } from '../auth/email.service';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    private emailService: EmailService,
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

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return this.userRepository.findOneBy({ email });
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // mark user as deleted in the db (softdelete)
    await this.userRepository.softDelete(id);

    // definitive deletion date
    const deleteScheduledAt = new Date();
    deleteScheduledAt.setDate(deleteScheduledAt.getDate() + 30);

    // update the date in the repository
    await this.userRepository.update(id, {
      delete_scheduled_at: deleteScheduledAt,
    });

    // sends the email to the user
    await this.emailService.sendDeletionNotification(user, deleteScheduledAt);
    return { message: 'User deletion scheduled successfully' };
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

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async updateEmail(
    userId: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      updateEmailDto.current_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // check if email already existig
    const existingUser = await this.userRepository.findOneBy({
      email: updateEmailDto.email,
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email already in use');
    }

    user.email = updateEmailDto.email;
    user.email_verified = false;
    const updatedUser = await this.userRepository.save(user);

    // send a new verification email + token
    try {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await argon2.hash(rawToken);
      const expires_at = new Date(Date.now() + 1000 * 60 * 60); // 1h

      await this.emailVerificationTokenRepository.insert({
        email_token: hashedToken,
        user: updatedUser,
        expires_at,
        used: false,
      });

      await this.emailService.sendVerificationEmail(updatedUser, rawToken);

      console.log('Verification email sent to:', updatedUser.email);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
    return updatedUser;
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check current password (when asking the user to input the old one to create a new one)
    const isPasswordValid = await argon2.verify(
      user.password,
      updatePasswordDto.current_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // check if both password match (password and confirm password)
    if (updatePasswordDto.new_password !== updatePasswordDto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // check if new password is identical to the old one
    const isSamePassword = await argon2.verify(
      user.password,
      updatePasswordDto.new_password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // hash password, save
    user.password = await argon2.hash(updatePasswordDto.new_password);
    await this.userRepository.save(user);
    return { message: 'Password updated successfully' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupDeletedUsers() {
    console.log('Executing cronjob for deleted users');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // find users with deleted_at > 30 days
    const usersToDelete = await this.userRepository.find({
      where: {
        deleted_at: Not(IsNull()),
        delete_scheduled_at: LessThanOrEqual(thirtyDaysAgo),
      },
    });

    // hard delete
    for (const user of usersToDelete) {
      await this.userRepository.delete(user.id);
      console.log(`User ${user.id} deleted.`);
    }
  }
}
