import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'types';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { State } from './state.entity';

const accessToken = faker.random.alphaNumeric(20);
const user: User = {
  id: faker.datatype.uuid(),
  name: faker.internet.userName(),
  email: faker.internet.email(),
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
      const req = createMock<Request>();
      service.login.mockResolvedValueOnce({ access_token: accessToken });
      const response = await controller.ftCallback({ ...req, user });
      expect(service.login).toHaveBeenCalledWith(user);
      expect(response).toHaveProperty('access_token', accessToken);
    });
    it('should return the access token of the user', async () => {
      const req = createMock<Request>();
      service.login.mockResolvedValueOnce({ access_token: accessToken });
      const response = await controller.ftCallback({ ...req, user });
      expect(service.login).toHaveBeenCalledWith(user);
      expect(response).toHaveProperty('access_token', accessToken);
    });
  });
});
