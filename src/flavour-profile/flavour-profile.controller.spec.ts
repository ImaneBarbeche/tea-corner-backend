import { Test, TestingModule } from '@nestjs/testing';
import { FlavourProfileController } from './flavour-profile.controller';

describe('FlavourController', () => {
  let controller: FlavourProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlavourProfileController],
    }).compile();

    controller = module.get<FlavourProfileController>(FlavourProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
