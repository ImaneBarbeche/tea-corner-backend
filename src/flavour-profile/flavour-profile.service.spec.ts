import { Test, TestingModule } from '@nestjs/testing';
import { FlavourProfileService } from './flavour-profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlavourProfile } from './flavour-profile.entity';

describe('FlavourService', () => {
  let service: FlavourProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlavourProfileService,
        {
          provide: getRepositoryToken(FlavourProfile),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FlavourProfileService>(FlavourProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
