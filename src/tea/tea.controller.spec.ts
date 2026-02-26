import { Test, TestingModule } from '@nestjs/testing';
import { TeaController } from './tea.controller';
import { TeaService } from './tea.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

describe('TeaController', () => {
  let controller: TeaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeaController],
      providers: [
        {
          provide: TeaService,
          useValue: {
            findAll: jest.fn(),
            findSystemTeas: jest.fn(),
            findPublicTeas: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            addIngredient: jest.fn(),
            getIngredients: jest.fn(),
            updateIngredient: jest.fn(),
            removeIngredient: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TeaController>(TeaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
