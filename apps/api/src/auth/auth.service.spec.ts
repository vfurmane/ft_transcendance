import { HttpService } from '@nestjs/axios';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { faker } from '@faker-js/faker';
import { FtUser } from 'types';
import { Logger } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigModule } from '@nestjs/config';
import ftOauth2Configuration from '../config/ft-oauth2';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { State } from './state.entity';
import { User as UserEntity } from '../users/user.entity';

const JWT_SECRET = faker.random.alphaNumeric(20);
const code = faker.random.alphaNumeric(20);
const ftUser: FtUser = {
  login: faker.internet.userName(),
  email: faker.internet.email(),
};
const user: User = {
  id: faker.datatype.uuid(),
  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),
  states: [],
  name: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  tfa_secret: null,
  tfa_setup: false,
};

describe('AuthService', () => {
  let service: AuthService;
  let httpService: DeepMocked<HttpService>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [ftOauth2Configuration],
        }),
        JwtModule.register({
          secret: JWT_SECRET,
        }),
      ],
      providers: [
        AuthService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: Logger,
          useValue: createMock<Logger>(),
        },
        {
          provide: getRepositoryToken(State),
          useValue: createMock(),
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: createMock(),
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    httpService = module.get(HttpService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchProfileWithToken', () => {
    it('should return the 42 user', async () => {
      httpService.get.mockImplementationOnce(() =>
        of({
          data: ftUser,
        } as AxiosResponse<FtUser>),
      );
      const response = await service.fetchProfileWithToken(code);
      expect(response).toHaveProperty('login', ftUser.login);
      expect(response).toHaveProperty('email', ftUser.email);
    });
    it('should handle errors', async () => {
      const errorMessage = faker.hacker.phrase();
      httpService.get.mockImplementationOnce(() =>
        throwError(() => ({
          response: {
            data: errorMessage,
          },
        })),
      );
      await expect(service.fetchProfileWithToken(code)).rejects.toMatch(
        "An error occured while fetching the user's profile using its access token.",
      );
    });
  });

  describe('login', () => {
    it('should return an object containing the access token', () => {
      const response = service.login(user);
      const payload = jwtService.decode(response.access_token);
      expect(payload).toHaveProperty('sub', user.id);
      expect(payload).toHaveProperty('name', user.name);
    });
  });
});
