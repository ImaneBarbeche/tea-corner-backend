import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Status, User } from './user.entity';
import { Role } from '../enums/role.enum';
import { UpdateUsernameDto } from './update-username.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            UpdateUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const result: User[] = [
        {
          id: '1',
          user_name: 'john_doe',
          display_name: 'john_doe',
          avatar_url: 'adfadf',
          banner_color: 'afadf',
          bio: 'adfadf',
          password: 'adfadferd',
          role: Role['user'],
          status: Status['ACTIVE'],
          email: 'john@example.com',
          email_verified: true,
          username_last_changed: new Date(),
          created_at: new Date(),
          modified_at: new Date(),
          deleted_at: new Date(),
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAllUsers()).toBe(result);
    });
  });

  describe('change username', () => {
    it('should change the username, up to once a month', async () => {});
  });
});
