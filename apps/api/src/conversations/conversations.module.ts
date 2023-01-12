import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationRole } from './entities/conversationRole.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationRestriction } from './entities/conversationRestriction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([ConversationRole]),
    TypeOrmModule.forFeature([ConversationRestriction]),
    UsersModule
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService]
})
export class ConversationsModule {}
