import { Test, TestingModule } from '@nestjs/testing';
import { UserTeaController } from './user-tea.controller';
import { UserTeaService } from './user-tea.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

describe('UserTeaController', () => {
  let controller: UserTeaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTeaController],
      providers: [
        {
          provide: UserTeaService,
          useValue: {
            findAll: jest.fn(),
            findUserLibrary: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserTeaController>(UserTeaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
