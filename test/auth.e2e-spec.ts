import request from 'supertest';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/user.entity';
import { Repository } from 'typeorm';

describe('Auth E2E', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    // 1) Créer le module de test
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    // 2) Initialiser l'app Nest
    app = moduleRef.createNestApplication();
    await app.init();

    userRepo = moduleRef.get(getRepositoryToken(User));
  });

  it('should sign in and return cookies', async () => {
    // 1) Créer un user dans la DB
    const hashed = await argon2.hash('12345678');
    await userRepo.save({
      user_name: 'test',
      password: hashed,
      email_verified: true,
    });
    // 2) Appeler POST /auth/signin
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ user_name: 'test', password: '12345678' });
    // 3) Vérifier status
    expect(res.status).toBe(200);
    // 4) Vérifier cookies
    expect(res.headers['set-cookie']).toBeDefined();
  });

  afterAll(async () => {
    // fermer l'app
    await app.close();
  });
});
