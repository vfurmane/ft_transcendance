import { Conversation } from 'types';
import { ConversationRestriction } from 'types';
import { ConversationRole } from 'types';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Message } from 'types';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ConversationsGateway } from './conversations.gateway';
import { AuthModule } from '../auth/auth.module';
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
    AuthModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsGateway],
  exports: [ConversationsService, TypeOrmModule],
})
export class ConversationsModule {}
