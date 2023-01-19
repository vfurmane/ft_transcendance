import { Conversation } from 'types';
import { ConversationRestriction } from 'types';
import { ConversationRole } from 'types';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Message } from 'types';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

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
