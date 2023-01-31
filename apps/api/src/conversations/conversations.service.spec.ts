import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'types';
import { ConversationsService } from './conversations.service';
import { Conversation } from 'types';
import { ConversationRestriction } from 'types';
import { ConversationRole } from 'types';
import { Message } from 'types';

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
