import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'types';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from 'types';
import { ConversationRestriction } from 'types';
import { ConversationRole } from 'types';
import { Message } from 'types';

describe('ConversationsController', () => {
  let controller: ConversationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: createMock<ConversationsService>(),
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: createMock<Repository<Conversation>>(),
        },
        {
          provide: getRepositoryToken(ConversationRole),
          useValue: createMock<Repository<ConversationRole>>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: getRepositoryToken(Message),
          useValue: createMock<Repository<Message>>(),
        },
        {
          provide: getRepositoryToken(ConversationRestriction),
          useValue: createMock<Repository<ConversationRestriction>>(),
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
