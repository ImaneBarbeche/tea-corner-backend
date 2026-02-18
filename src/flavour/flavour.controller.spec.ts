import { Test, TestingModule } from '@nestjs/testing';
import { FlavourController } from './flavour.controller';

describe('FlavourController', () => {
  let controller: FlavourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlavourController],
    }).compile();

    controller = module.get<FlavourController>(FlavourController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
