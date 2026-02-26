import { Test, TestingModule } from '@nestjs/testing';
import { TeaStyleService } from './tea-style.service';

describe('TeaStyleService', () => {
  let service: TeaStyleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeaStyleService],
    }).compile();

    service = module.get<TeaStyleService>(TeaStyleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
