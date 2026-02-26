import { Test, TestingModule } from '@nestjs/testing';
import { FlavourTypeController } from './flavour-type.controller';
import { FlavourTypeService } from './flavour-type.service';
import { AuthGuard } from '../guards/auth.guard';

describe('FlavourTypeController', () => {
  let controller: FlavourTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlavourTypeController],
      providers: [
        {
          provide: FlavourTypeService,
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

    controller = module.get<FlavourTypeController>(FlavourTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
