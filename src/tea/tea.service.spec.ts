import { Test, TestingModule } from '@nestjs/testing';
import { TeaService } from './tea.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tea } from './tea.entity';
import { TeaIngredient } from '../ingredient/tea-ingredient.entity';
import { Ingredient } from '../ingredient/ingredient.entity';
import { TeaStyleService } from '../tea-style/tea-style.service';

describe('TeaService', () => {
  let service: TeaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeaService,
        {
          provide: getRepositoryToken(Tea),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TeaIngredient),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Ingredient),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TeaStyleService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeaService>(TeaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
