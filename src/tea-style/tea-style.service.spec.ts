import { Test, TestingModule } from '@nestjs/testing';
import { TeaStyleService } from './tea-style.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeaStyle } from './tea-style.entity';

describe('TeaStyleService', () => {
  let service: TeaStyleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeaStyleService,
        {
          provide: getRepositoryToken(TeaStyle),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeaStyleService>(TeaStyleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
