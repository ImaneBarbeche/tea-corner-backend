import { forwardRef, Module } from '@nestjs/common';
import { UserTeaService } from './user-tea.service';
import { UserTeaController } from './user-tea.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTea } from './user-tea.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TeaModule } from 'src/tea/tea.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTea]),
    forwardRef(() => AuthModule),
    TeaModule,
  ],
  providers: [UserTeaService],
  exports: [TypeOrmModule, UserTeaService],
  controllers: [UserTeaController],
})
export class UserTeaModule {}
