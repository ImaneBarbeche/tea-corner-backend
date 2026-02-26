import { Test, TestingModule } from '@nestjs/testing';
import { FlavourTypeService } from './flavour-type.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlavourType } from './flavour-type.entity';

describe('FlavourTypeService', () => {
  let service: FlavourTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlavourTypeService,
        {
          provide: getRepositoryToken(FlavourType),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FlavourTypeService>(FlavourTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
