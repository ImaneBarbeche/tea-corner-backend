import { Test, TestingModule } from '@nestjs/testing';
import { UserTeaController } from './user-tea.controller';

describe('UserTeaController', () => {
  let controller: UserTeaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTeaController],
    }).compile();

    controller = module.get<UserTeaController>(UserTeaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
