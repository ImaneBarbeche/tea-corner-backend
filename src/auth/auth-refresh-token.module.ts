import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRefreshToken } from '../entities/auth-refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthRefreshToken])],
  exports: [TypeOrmModule],
})
export class AuthRefreshTokenModule {}
