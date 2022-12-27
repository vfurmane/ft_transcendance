import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { State } from './state.entity';

const accessToken = faker.random.alphaNumeric(20);
const user: User = {
  id: faker.datatype.uuid(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
  name: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  tfa_secret: null,
  tfa_setup: false,
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
        {
          provide: getRepositoryToken(State),
          useValue: createMock<Repository<State>>(),
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
        Logger,
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ftCallback', () => {
    it('should return the access token of the user', async () => {
      service.login.mockReturnValueOnce({ access_token: accessToken });
      const response = controller.ftCallback(user);
      expect(service.login).toHaveBeenCalledWith(user);
      expect(response).toHaveProperty('access_token', accessToken);
    });
  });
});
