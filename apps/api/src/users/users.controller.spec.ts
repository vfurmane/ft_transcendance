import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User as UserEntity } from './user.entity';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Jwt } from '../auth/jwt.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import ftOauth2Configuration from '../config/ft-oauth2';
import { faker } from '@faker-js/faker';
import { HttpService } from '@nestjs/axios';
import { State } from '../auth/state.entity';

const JWT_SECRET = faker.random.alphaNumeric(20);

describe('UsersController', () => {
  let controller: UsersController;

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
      controllers: [UsersController],
      providers: [
        AuthService,
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
          provide: getRepositoryToken(UserEntity),
          useValue: createMock<Repository<UserEntity>>(),
        },
        {
          provide: getRepositoryToken(State),
          useValue: createMock<Repository<State>>(),
        },
        Logger,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
