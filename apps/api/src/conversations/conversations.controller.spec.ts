import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from './entities/conversation.entity';
import { ConversationRestriction } from './entities/conversationRestriction.entity';
import { ConversationRole } from './entities/conversationRole.entity';
import { Message } from './entities/message.entity';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  // let service: DeepMocked<ConversationsService>;

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
    // service = module.get(ConversationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
