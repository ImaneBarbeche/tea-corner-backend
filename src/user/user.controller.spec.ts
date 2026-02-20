import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Status, User } from './user.entity';
import { Role } from '../enums/role.enum';
import { UpdateUsernameDto } from './update-username.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './update-user.dto';

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
            findByUsername: jest.fn(),
            update: jest.fn(),
            updateUserName: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('UpdateProfile', () => {
    it("should update the user's profile using the updateUserDTO from the request", async () => {
      const mockUser: User = {
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
        teas: [],
      };

      const updateDto: UpdateUserDto = {
        display_name: 'john_doe',
        avatar_url: 'adfadf',
        banner_color: 'afadf',
        bio: 'adfadf',
      } as UpdateUserDto;

      jest.spyOn(service, 'update').mockResolvedValue(mockUser);

      const req = { user: { sub: 1 } };
      const result = await controller.updateProfile(req, updateDto);

      expect(result).toBe(mockUser);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('findUserProfile', () => {
    it('should return the user profile using the username from the request', async () => {
      const result: User = {
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
        teas: [],
      };
      jest.spyOn(service, 'findByUsername').mockResolvedValue(result);

      const req = { user: { username: 'john_doe' } };
      expect(await controller.findUserProfile(req)).toBe(result);
      expect(service.findByUsername).toHaveBeenLastCalledWith('john_doe');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(service, 'findByUsername').mockResolvedValue(null);

      const req = { user: { username: 'nonexistent' } };
      await expect(controller.findUserProfile(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('change username', () => {
    it('should change the username, up to once a month', async () => {});
  });
});
