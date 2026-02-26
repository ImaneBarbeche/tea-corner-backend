import { Test, TestingModule } from '@nestjs/testing';
import { FlavourTypeService } from './flavour-type.service';

describe('FlavourTypeService', () => {
  let service: FlavourTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlavourTypeService],
    }).compile();

    service = module.get<FlavourTypeService>(FlavourTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
