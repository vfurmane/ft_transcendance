import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { User } from 'src/users/user.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationsService } from './conversations.service';
import { createConversationDto } from './dtos/createConversation.dto';
import { sendMessageDto } from './dtos/sendMessage.dto';
import { updateRoleDto } from './dtos/updateRole.dto';
import { isUUIDDto } from './dtos/IsUUID.dto';
import { muteUserDto } from './dtos/muteUser.dto';
import { conversationRestrictionEnum } from './conversationRestriction.enum';
import { isDateDto } from './dtos/isDate.dto';
import { User as CurrentUser } from 'src/common/decorators/user.decorator';

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
    createConversation(@CurrentUser() currentUser: User, @Body() newConversation: createConversationDto): Promise<Conversation>
    {
        return (this.conversationsService.createConversation(newConversation, currentUser));
    }

    @Get('/unread')
    unreadCount(@CurrentUser() currentUser: User)
    {
        return (this.conversationsService.unreadCount(currentUser));
    }

    @Get('/:id')
    getMessages(@CurrentUser() currentUser: User, @Param() {id}: isUUIDDto)
    {
        return (this.conversationsService.getMessages(currentUser, id));
    }

    @Post('/:id/post')
    postMessage(@CurrentUser() currentUser: User, @Param() {id}: isUUIDDto, @Body() {content} : sendMessageDto)
    {
        return (this.conversationsService.postMessage(currentUser, id, content));
    }

    @Get('/:id/join')
    joinConversation(@CurrentUser() currentUser : User, @Param() {id}: isUUIDDto)
    {
        return this.conversationsService.joinConversation(currentUser, id, null);
    }

    @Post('/:id/join')
    joinProtectedConversation(@CurrentUser() currentUser : User, @Param() {id}: isUUIDDto, @Body('password') password: string)
    {
        return this.conversationsService.joinConversation(currentUser, id, password);
    }

    @Get('/:id/participants')
    getConversationParticipants(@CurrentUser() currentUser : User, @Param() {id}: isUUIDDto)
    {
        return this.conversationsService.getConversationParticipants(currentUser, id);
    }

    @Patch('/:id/updateRole')
    updateRole(@CurrentUser() CurrentUser: User, @Param() {id}: isUUIDDto, @Body() newRole: updateRoleDto): Promise<boolean>
    {
        return this.conversationsService.updateRole(id, newRole, CurrentUser);
    }

    @Delete('/:id/leave')
    leaveConversation(@CurrentUser() currentUser : User, @Param() {id} : isUUIDDto)
    {
        return (this.conversationsService.leaveConversation(currentUser, id));
    }

    @Patch('/:id/mute/:username')
    muteUser(@CurrentUser() currentUser: User, @Param() muteUser: muteUserDto, @Body() {date}: isDateDto)
    {
        return (this.conversationsService.restrictUser(currentUser, muteUser.id, muteUser.username, conversationRestrictionEnum.MUTE, new Date(date)))
    }

    @Patch('/:id/ban/:username')
    banUser(@CurrentUser() currentUser: User, @Param() muteUser: muteUserDto, @Body() {date}: isDateDto,  )
    {
        return (this.conversationsService.restrictUser(currentUser, muteUser.id, muteUser.username, conversationRestrictionEnum.BAN, new Date(date)))
    }
}
