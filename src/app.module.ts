import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthRefreshToken } from './auth/auth-refresh-token.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TeaController } from './tea/tea.controller';
import { TeaService } from './tea/tea.service';
import { TeaModule } from './tea/tea.module';
import { TeaStyleController } from './tea-style/tea-style.controller';
import { TeaStyleService } from './tea-style/tea-style.service';
import { TeaStyleModule } from './tea-style/tea-style.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60s window
        limit: 10, // 10 request max per minute
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, AuthRefreshToken],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UserModule,
    AuthModule,
    TeaModule,
    TeaStyleModule,
  ],
  controllers: [AppController, AuthController, TeaController, TeaStyleController],
  providers: [
    AppService,
    { provide: APP_GUARD, 
      useClass: ThrottlerGuard 
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    TeaService,
    TeaStyleService,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
