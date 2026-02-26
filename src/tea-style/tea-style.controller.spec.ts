import { Test, TestingModule } from '@nestjs/testing';
import { TeaStyleController } from './tea-style.controller';
import { TeaStyleService } from './tea-style.service';

describe('TeaStyleController', () => {
  let controller: TeaStyleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeaStyleController],
      providers: [
        {
          provide: TeaStyleService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeaStyleController>(TeaStyleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
