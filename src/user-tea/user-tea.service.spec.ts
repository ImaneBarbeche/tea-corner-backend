import { Test, TestingModule } from '@nestjs/testing';
import { UserTeaService } from './user-tea.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserTea } from './user-tea.entity';
import { TeaService } from '../tea/tea.service';

describe('UserTeaService', () => {
  let service: UserTeaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTeaService,
        {
          provide: getRepositoryToken(UserTea),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: TeaService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserTeaService>(UserTeaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
