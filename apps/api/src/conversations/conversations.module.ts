import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationRole } from './entities/conversationRole.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationRestriction } from './entities/conversationRestriction.entity';
import { ConversationsGateway } from './conversations.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      ConversationRole,
      ConversationRestriction,
    ]),
    UsersModule,
    AuthModule
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsGateway],
  exports: [ConversationsService, TypeOrmModule],
})
export class ConversationsModule {}
