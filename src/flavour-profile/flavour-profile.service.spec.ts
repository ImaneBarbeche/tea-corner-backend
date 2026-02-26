import { Test, TestingModule } from '@nestjs/testing';
import { FlavourProfileService } from './flavour-profile.service';

describe('FlavourService', () => {
  let service: FlavourProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlavourProfileService],
    }).compile();

    service = module.get<FlavourProfileService>(FlavourProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
