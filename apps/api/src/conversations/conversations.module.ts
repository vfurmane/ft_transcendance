import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'types';
import { Message } from 'types';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationRole } from 'types';
import { UsersModule } from 'src/users/users.module';
import { ConversationRestriction } from 'types';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      ConversationRole,
      ConversationRestriction,
    ]),
    UsersModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService, TypeOrmModule],
})
export class ConversationsModule {}
