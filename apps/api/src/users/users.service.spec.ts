import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { User as UserEntity } from 'types';
import { AddUserData, UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import ftOauth2Configuration from '../config/ft-oauth2';
import { State } from '../auth/state.entity';
import { Jwt } from '../auth/jwt.entity';
import { JwtModule } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';

const JWT_SECRET = faker.random.alphaNumeric(20);
const name = faker.internet.userName();
const email = faker.internet.email();
const addUserDto: AddUserData = {
  name,
  email,
  password: null,
};
const userEntity: UserEntity = {
  id: faker.datatype.uuid(),
  created_at: faker.datatype.datetime(),
  updated_at: faker.datatype.datetime(),
  email,
  name,
  password: faker.internet.password(),
  states: [],
  tfa_secret: null,
  tfa_setup: false,
  messages: [],
  conversationRoles: [],
  jwts: [],
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: DeepMocked<Repository<UserEntity>>;

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
        Logger,
        UsersService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: getRepositoryToken(Jwt),
          useValue: createMock<Repository<Jwt>>(),
        },
        {
          provide: getRepositoryToken(State),
          useValue: createMock<Repository<State>>(),
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: createMock<Repository<UserEntity>>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByEmail', () => {
    it('should return the User', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(userEntity);
      const response = await service.getByEmail(email);
      expect(response).toBe(userEntity);
    });
    it('should return null if not found', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(null);
      const response = await service.getByEmail(email);
      expect(response).toBeNull();
    });
  });

  describe('addUser', () => {
    it('should return the User', async () => {
      usersRepository.save.mockResolvedValueOnce(userEntity);
      const response = await service.addUser(addUserDto);
      expect(response).toBe(userEntity);
    });
  });
});
