import { Test, TestingModule } from '@nestjs/testing';
import { BrewLogService } from './brew-log.service';

describe('BrewLogService', () => {
  let service: BrewLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrewLogService],
    }).compile();

    service = module.get<BrewLogService>(BrewLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
