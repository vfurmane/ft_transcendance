import { Test, TestingModule } from '@nestjs/testing';
import { Conversation } from './entities/conversation.entity';
import { ConversationRestriction } from './entities/conversationRestriction.entity';
import { ConversationRole } from './entities/conversationRole.entity';
import { ConversationsService } from './conversations.service';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

describe('ConversationsService', () => {
  let service: ConversationsService;
  // let conversationRepository: DeepMocked<Repository<Conversation>>;
  // let conversationRoleRepository: DeepMocked<Repository<ConversationRole>>;
  // let userRepository: DeepMocked<Repository<User>>;
  // let messageRepository: DeepMocked<Repository<Message>>;
  // let conversationRestrictionRepository: DeepMocked<
  //   Repository<ConversationRestriction>
  // >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
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

    service = module.get<ConversationsService>(ConversationsService);
    // conversationRepository = module.get(getRepositoryToken(Conversation));
    // conversationRoleRepository = module.get(
    //   getRepositoryToken(ConversationRole),
    // );
    // userRepository = module.get(getRepositoryToken(User));
    // messageRepository = module.get(getRepositoryToken(Message));
    // conversationRestrictionRepository = module.get(
    //   getRepositoryToken(ConversationRestriction),
    // );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
