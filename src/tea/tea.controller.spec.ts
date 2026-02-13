import { Test, TestingModule } from '@nestjs/testing';
import { TeaController } from './tea.controller';

describe('TeaController', () => {
  let controller: TeaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeaController],
    }).compile();

    controller = module.get<TeaController>(TeaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
