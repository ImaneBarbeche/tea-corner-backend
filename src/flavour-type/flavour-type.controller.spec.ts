import { Test, TestingModule } from '@nestjs/testing';
import { FlavourTypeController } from './flavour-type.controller';

describe('FlavourTypeController', () => {
  let controller: FlavourTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlavourTypeController],
    }).compile();

    controller = module.get<FlavourTypeController>(FlavourTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
