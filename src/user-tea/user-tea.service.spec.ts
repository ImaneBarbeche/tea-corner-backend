import { Test, TestingModule } from '@nestjs/testing';
import { UserTeaService } from './user-tea.service';

describe('UserTeaService', () => {
  let service: UserTeaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTeaService],
    }).compile();

    service = module.get<UserTeaService>(UserTeaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
