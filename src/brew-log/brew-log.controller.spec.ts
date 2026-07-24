import { Test, TestingModule } from '@nestjs/testing';
import { BrewLogController } from './brew-log.controller';

describe('BrewLogController', () => {
  let controller: BrewLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrewLogController],
    }).compile();

    controller = module.get<BrewLogController>(BrewLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
