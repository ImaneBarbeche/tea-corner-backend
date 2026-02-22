import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailService } from '../auth/email.service';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerificationToken]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, UserService],
  providers: [UserService, EmailService],
  controllers: [UserController],
})
export class UserModule {}
