import { Test, TestingModule } from '@nestjs/testing';
import { TeaStyleController } from './tea-style.controller';

describe('TeaStyleController', () => {
  let controller: TeaStyleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeaStyleController],
    }).compile();

    controller = module.get<TeaStyleController>(TeaStyleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
