import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User as UserEntity } from './user.entity';
import { AddUserData, UsersService } from './users.service';

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
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: DeepMocked<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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
