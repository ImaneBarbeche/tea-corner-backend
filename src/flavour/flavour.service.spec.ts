import { Test, TestingModule } from '@nestjs/testing';
import { FlavourService } from './flavour.service';

describe('FlavourService', () => {
  let service: FlavourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlavourService],
    }).compile();

    service = module.get<FlavourService>(FlavourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
