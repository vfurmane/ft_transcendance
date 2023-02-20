import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block, Conversation } from 'types';
import { Message } from 'types';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationRole } from 'types';
import { UsersModule } from 'src/users/users.module';
import { ConversationsGateway } from './conversations.gateway';
import { AuthModule } from '../auth/auth.module';
import { ConversationRestriction } from 'types';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Block,
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
