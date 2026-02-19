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
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    // Nest init
    app = moduleRef.createNestApplication();
    await app.init();

    userRepo = moduleRef.get(getRepositoryToken(User));
  });

  it('should sign in and return cookies', async () => {
    // create user in database
    const hashed = await argon2.hash('12345678');
    await userRepo.save({
      user_name: 'test',
      password: hashed,
      email_verified: true,
    });
    // call the api route
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ user_name: 'test', password: '12345678' });
    // check for status
    expect(res.status).toBe(200);
    // check cookies
    expect(res.headers['set-cookie']).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
