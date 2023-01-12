import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { User } from 'src/users/user.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationsService } from './conversations.service';
import { createConversationDto } from './dtos/createConversation.dto';
import { sendMessageDto } from './dtos/sendMessage.dto';
import { updateRoleDto } from './dtos/updateRole.dto';
import { paramIsUUIDDto } from './dtos/paramIsUUID.dto';
import { muteUserDto } from './dtos/muteUser.dto';
import { conversationRestrictionEnum } from './conversationRestriction.enum';
import { isDateDto } from './dtos/isDate.dto';
import { CurrentUser } from 'src/users/current-user.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService){}


    @Get('/')
    getConversations(@CurrentUser() currentUser: User)
    {
        return (this.conversationsService.getConversations(currentUser));
    }

    @Put('/create')
    createConversation(@Body() newConversation: createConversationDto, @CurrentUser() currentUser: User): Promise<Conversation>
    {
        return (this.conversationsService.createConversation(newConversation, currentUser));
    }

    @Get('/unread')
    unreadCount(@CurrentUser() currentUser: User)
    {
        return (this.conversationsService.unreadCount(currentUser));
    }

    @Get('/:id')
    getMessages(@CurrentUser() currentUser: User, @Param() conversationId: paramIsUUIDDto)
    {
        return (this.conversationsService.getMessages(currentUser, conversationId.id));
    }

    @Post('/:id/post')
    postMessage(@Param() conversationId: paramIsUUIDDto, @Body() content: sendMessageDto, @CurrentUser() currentUser: User)
    {
        return (this.conversationsService.postMessage(currentUser, conversationId.id, content.content));
    }

    @Get('/:id/join')
    joinConversation(@Param() conversationId: paramIsUUIDDto, @CurrentUser() currentUser : User)
    {
        return this.conversationsService.joinConversation(currentUser, conversationId.id, null);
    }

    @Post('/:id/join')
    joinProtectedConversation(@Param() conversationId: paramIsUUIDDto, @CurrentUser() currentUser : User, @Body('password') password: string)
    {
        return this.conversationsService.joinConversation(currentUser, conversationId.id, password);
    }

    @Get('/:id/participants')
    getConversationParticipants(@Param() conversationId: paramIsUUIDDto, @CurrentUser() currentUser : User)
    {
        return this.conversationsService.getConversationParticipants(currentUser, conversationId.id);
    }

    @Patch('/:id/updateRole')
    updateRole(@Param() conversationId: paramIsUUIDDto, @Body() newRole: updateRoleDto, @CurrentUser() CurrentUser: User): Promise<boolean>
    {
        return this.conversationsService.updateRole(conversationId.id, newRole, CurrentUser);
    }

    @Delete('/:id/leave')
    leaveConversation(@Param() conversationId : paramIsUUIDDto, @CurrentUser() currentUser : User)
    {
        return (this.conversationsService.leaveConversation(currentUser, conversationId.id));
    }

    @Patch('/:id/mute/:username')
    muteUser(@Body() timestamp: isDateDto, @Param() muteUser: muteUserDto, @CurrentUser() currentUser: User)
    {
        return (this.conversationsService.restrictUser(currentUser, muteUser.id, muteUser.username, conversationRestrictionEnum.MUTE, new Date(timestamp.date)))
    }

    @Patch('/:id/ban/:username')
    banUser(@Body() timestamp: isDateDto, @Param() muteUser: muteUserDto, @CurrentUser() currentUser: User)
    {
        return (this.conversationsService.restrictUser(currentUser, muteUser.id, muteUser.username, conversationRestrictionEnum.BAN, new Date(timestamp.date)))
    }
}
