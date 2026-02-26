import { Test, TestingModule } from '@nestjs/testing';
import { FlavourProfileController } from './flavour-profile.controller';
import { FlavourProfileService } from './flavour-profile.service';
import { AuthGuard } from '../guards/auth.guard';

describe('FlavourController', () => {
  let controller: FlavourProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlavourProfileController],
      providers: [
        {
          provide: FlavourProfileService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FlavourProfileController>(FlavourProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
