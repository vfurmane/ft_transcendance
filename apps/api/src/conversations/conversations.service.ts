import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DMExists, InvitationEnum, User, Block } from 'types';
import { MoreThan, Not, Repository, DeleteResult } from 'typeorm';
import {
  ConversationsDetails,
  ConversationWithUnread,
  unreadMessagesResponse,
} from 'types';
import { Conversation } from 'types';
import { ConversationRoleEnum } from 'types';
import { ConversationRole } from 'types';
import { createConversationDto } from './dtos/createConversation.dto';
import { updateRoleDto } from './dtos/updateRole.dto';
import { Message } from 'types';
import * as bcrypt from 'bcrypt';
import { conversationRestrictionEnum } from 'types';
import { ConversationRestriction } from 'types';
import { invitationDto } from './dtos/invitation.dto';
import { muteUserDto } from './dtos/muteUser.dto';
import { addConversationPasswordDto } from './dtos/addConversationPassword.dto';
import { updateConversationPasswordDto } from './dtos/updateConversationPassword.dto';
import { removeConversationPasswordDto } from './dtos/removeConversationPassword.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Block)
    private readonly blocksRepository: Repository<Block>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationRole)
    private readonly conversationRoleRepository: Repository<ConversationRole>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationRestriction)
    private readonly conversationRestrictionRepository: Repository<ConversationRestriction>,
  ) {}

  async getListOfDMs({ id }: User | { id: string }): Promise<Conversation[]> {
    const listOfDMs: Conversation[] = [];
    const conversationRolesList = await this.conversationRoleRepository.find({
      relations: {
        user: true,
        conversation: true,
      },
      where: {
        user: {
          id: id,
        },
        conversation: {
          groupConversation: false,
        },
      },
    });
    for (const conversationRole of conversationRolesList) {
      listOfDMs.push(conversationRole.conversation);
    }
    return listOfDMs;
  }

  async DMExists(currentUser: User, targetUserId: string): Promise<DMExists> {
    const creatorDMs = await this.getListOfDMs(currentUser);
    const recipientDMs = await this.getListOfDMs({ id: targetUserId });
    for (const creatorDM of creatorDMs) {
      if (recipientDMs.filter((el) => el.id === creatorDM.id).length) {
        const fullConversation = await this.conversationRepository.findOne({
          relations: {
            conversationRoles: true,
          },
          where: {
            id: creatorDM.id,
          },
        });
        return {
          conversationExists: true,
          conversation: fullConversation ? fullConversation : creatorDM,
        };
      }
    }
    return { conversationExists: false, conversation: null };
  }

  async createDM(
    newConversation: createConversationDto,
    creator: User,
  ): Promise<{
    conversation: Conversation;
    newConversationMessage: Message | null;
  }> {
    if (newConversation.participant === undefined) {
      throw new BadRequestException('Unable to create DM without a target');
    }
    if (creator.id === newConversation.participant) {
      throw new BadRequestException(
        'You cannot have a conversation with yourself',
      );
    }
    const participant = await this.userRepository.findOne({
      where: {
        id: newConversation.participant,
      },
    });
    if (!participant) {
      throw new BadRequestException('Targeted user does not exist');
    }
    const creatorDMs = await this.getListOfDMs(creator);
    const recipientDMs = await this.getListOfDMs(participant);
    for (const creatorDM of creatorDMs) {
      if (recipientDMs.filter((el) => el.id === creatorDM.id).length)
        return { conversation: creatorDM, newConversationMessage: null };
    }
    const createdConversation =
      this.conversationRepository.create(newConversation);
    createdConversation.name = `${creator.name} - ${participant.name}`;
    createdConversation.password = null;
    createdConversation.visible = false;
    await this.conversationRepository.save(createdConversation);
    const conversationRoleCreator = this.conversationRoleRepository.create({
      lastRead: new Date(),
      role: ConversationRoleEnum.OWNER,
      user: creator,
      conversation: createdConversation,
    });
    await this.conversationRoleRepository.save(conversationRoleCreator);
    const conversationRoleParticipant = this.conversationRoleRepository.create({
      lastRead: new Date(),
      role: ConversationRoleEnum.ADMIN,
      user: participant,
      conversation: createdConversation,
    });
    await this.conversationRoleRepository.save(conversationRoleParticipant);
    const newConversationMessage = this.messageRepository.create({
      sender: null,
      conversation: createdConversation,
      content: `This is the beginning of your conversation`,
      system_generated: true,
    });
    this.messageRepository.save(newConversationMessage);
    return { conversation: createdConversation, newConversationMessage };
  }

  async createConversation(
    newConversation: createConversationDto,
    creator: User,
  ): Promise<{
    conversation: Conversation;
    newConversationMessage: Message | null;
  }> {
    const users: User[] = [];

    if (!newConversation.groupConversation)
      return this.createDM(newConversation, creator);
    if (!newConversation.name) {
      throw new BadRequestException(
        'Please provide a name for your new group conversation',
      );
    }
    const createdConversation =
      this.conversationRepository.create(newConversation);
    if (createdConversation.password) {
      const salt = await bcrypt.genSalt();
      createdConversation.password = await bcrypt.hash(
        createdConversation.password,
        salt,
      );
      createdConversation.has_password = true;
    }
    await this.conversationRepository.save(createdConversation);
    const conversationRole = this.conversationRoleRepository.create({
      lastRead: new Date(),
      role: ConversationRoleEnum.OWNER,
      user: creator,
      conversation: createdConversation,
    });
    await this.conversationRoleRepository.save(conversationRole);
    const newConversationMessage = this.messageRepository.create({
      sender: null,
      conversation: createdConversation,
      content: `This is the beginning of ${newConversation.name}`,
      system_generated: true,
    });
    this.messageRepository.save(newConversationMessage);
    return { conversation: createdConversation, newConversationMessage };
  }

  async getChannels(currentUser: User): Promise<Conversation[]> {
    const userChannels = await this.conversationRepository.find({
      relations: {
        conversationRoles: true,
      },
      where: {
        groupConversation: true,
        visible: true,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
        },
      },
    });
    const channels = await this.conversationRepository.find({
      where: {
        groupConversation: true,
        visible: true,
      },
    });
    return channels.filter((channel) => {
      if (
        userChannels.filter((userChannel) => userChannel.id === channel.id)
          .length
      )
        return false;
      return true;
    });
  }

  async updateRole(
    conversationId: string,
    newRole: updateRoleDto,
    currentUser: User,
  ): Promise<boolean> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
        conversationRoles: {
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    if (!conversation)
      throw new NotFoundException('Conversation could not be found');
    const [currentUserRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (!currentUserRole)
      throw new ForbiddenException('You are not part of such a conversation');
    if (currentUserRole.restrictions.length)
      throw new ForbiddenException(
        'Cannot update roles while you have some restrictions upon you',
      );
    const [targetUserRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === newRole.userId,
    );
    if (!targetUserRole)
      throw new ForbiddenException(
        'The targeted user is not part of such a conversation',
      );
    if (targetUserRole.id === currentUserRole.id) {
      if (
        !(
          newRole.newRole === ConversationRoleEnum.USER &&
          currentUserRole.role === ConversationRoleEnum.ADMIN
        )
      )
        throw new ForbiddenException(
          'You are not allowed to change your role in this conversation',
        );
      currentUserRole.role = ConversationRoleEnum.USER;
      this.conversationRoleRepository.save(currentUserRole);
      return true;
    }
    switch (currentUserRole.role) {
      case ConversationRoleEnum.OWNER:
        if (newRole.newRole === ConversationRoleEnum.OWNER) {
          targetUserRole.role = ConversationRoleEnum.OWNER;
          currentUserRole.role = ConversationRoleEnum.ADMIN;
          this.conversationRoleRepository.save(currentUserRole);
        } else if (newRole.newRole === ConversationRoleEnum.ADMIN) {
          if (targetUserRole.role !== ConversationRoleEnum.USER)
            throw new ForbiddenException(
              'This user is already an administrator of this conversation',
            );
          targetUserRole.role = ConversationRoleEnum.ADMIN;
        } else {
          if (targetUserRole.role === ConversationRoleEnum.USER)
            throw new ForbiddenException('This user is already a regular user');
          targetUserRole.role = ConversationRoleEnum.USER;
        }
        break;
      case ConversationRoleEnum.ADMIN:
        if (targetUserRole.role !== ConversationRoleEnum.USER)
          throw new ForbiddenException(
            'You are not allowed to mofidy the role of this user',
          );
        if (newRole.newRole !== ConversationRoleEnum.ADMIN)
          throw new ForbiddenException(
            'You are not allowed to make this update',
          );
        targetUserRole.role = ConversationRoleEnum.ADMIN;
        break;
      default:
        throw new ForbiddenException(
          'You are not allowed to make changes in this conversation',
        );
        break;
    }
    this.conversationRoleRepository.save(targetUserRole);
    return true;
  }

  async getConversationsIds(userId: string): Promise<string[]> {
    const conversations = await this.conversationRepository.find({
      relations: {
        conversationRoles: true,
      },
      where: {
        conversationRoles: {
          user: {
            id: userId,
          },
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    return conversations.map((el) => el.id);
  }

  async getConversations(currentUser: User): Promise<ConversationsDetails> {
    const conversationsDetails: ConversationsDetails = {
      totalNumberOfUnreadMessages: 0,
      conversations: [],
    };
    let conversations = await this.conversationRepository.find({
      relations: {
        conversationRoles: true,
      },
      where: {
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    if (!conversations) return conversationsDetails;
    for (const conversation of conversations) {
      conversation.conversationRoles[0].restrictions =
        await this.verifyRestrictionsOnUser(
          conversation.conversationRoles[0].restrictions,
        );
      const currentConversationWithUnread: ConversationWithUnread = {
        conversation: conversation,
        numberOfUnreadMessages: 0,
        lastMessage: conversation.created_at,
      };
      if (
        !conversation.conversationRoles[0].restrictions.filter(
          (restriction) =>
            restriction.status === conversationRestrictionEnum.BAN,
        ).length
      ) {
        currentConversationWithUnread.numberOfUnreadMessages =
          await this.messageRepository.count({
            relations: {
              conversation: true,
            },
            where: {
              created_at: MoreThan(conversation.conversationRoles[0].lastRead),
              conversation: {
                id: conversation.id,
              },
            },
          });
        const lastMessage = await this.messageRepository.findOne({
          relations: {
            conversation: true,
          },
          where: {
            conversation: {
              id: conversation.id,
            },
          },
          order: {
            created_at: 'DESC',
          },
        });
        if (lastMessage)
          currentConversationWithUnread.lastMessage = lastMessage.created_at;
      }
      conversationsDetails.totalNumberOfUnreadMessages +=
        currentConversationWithUnread.numberOfUnreadMessages;
      if (!currentConversationWithUnread.conversation.groupConversation) {
        const check = await this.conversationRepository.findOne({
          relations: {
            conversationRoles: true,
          },
          where: {
            id: conversation.id,
          },
        });
        if (check) currentConversationWithUnread.conversation = check;
      }
      conversationsDetails.conversations.push(currentConversationWithUnread);
    }
    conversationsDetails.conversations.sort(
      (a, b) => b.lastMessage.getTime() - a.lastMessage.getTime(),
    );
    return conversationsDetails;
  }

  async getMessages(
    currentUser: User,
    conversationId: string,
  ): Promise<Message[]> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
        messages: {
          sender: true,
        },
      },
      where: {
        id: conversationId,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
      order: {
        messages: {
          created_at: 'ASC',
        },
      },
    });
    if (!conversation) {
      throw new NotFoundException();
    }
    const [userRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (
      userRole.restrictions.filter(
        (restriction) => restriction.status === conversationRestrictionEnum.BAN,
      ).length
    )
      throw new ForbiddenException(
        'Cannot get messages from a conversation from which you have been banned',
      );
    userRole.lastRead = new Date();
    this.conversationRoleRepository.save(userRole);
    return conversation.messages;
  }

  async unreadCount(currentUser: User): Promise<unreadMessagesResponse> {
    const response: unreadMessagesResponse = {
      totalNumberOfUnreadMessages: 0,
      UnreadMessage: [],
    };
    const conversationRoles = await this.conversationRoleRepository.find({
      relations: {
        conversation: true,
      },
      where: {
        user: {
          id: currentUser.id,
        },
        role: Not(ConversationRoleEnum.LEFT),
      },
    });
    if (!conversationRoles.length) {
      return response;
    }
    const blockedUser = await this.getBlockedUsers(currentUser.id);
    for (const role of conversationRoles) {
      if (
        (await this.verifyRestrictionsOnUser(role.restrictions)).filter(
          (restriction) =>
            restriction.status === conversationRestrictionEnum.BAN,
        ).length
      )
        continue;
      if (role.conversation.groupConversation === false) {
        const check = await this.conversationRoleRepository.findOne({
          relations: {
            conversation: true,
          },
          where: {
            conversation: {
              id: role.conversation.id,
            },
            user: {
              id: Not(currentUser.id),
            },
          },
        });
        if (
          check &&
          blockedUser.find((block) => block.target.id === check.user.id) !==
            undefined
        )
          continue;
      }
      const unreadMessages = await this.messageRepository.count({
        relations: {
          conversation: true,
        },
        where: {
          created_at: MoreThan(role.lastRead),
          conversation: {
            id: role.conversation.id,
          },
        },
      });
      if (unreadMessages) {
        response.totalNumberOfUnreadMessages += unreadMessages;
        response.UnreadMessage.push({
          conversationId: role.conversation.id,
          name: role.conversation.name,
          numberOfUnreadMessages: unreadMessages,
        });
      }
    }
    return response;
  }

  async postMessage(
    currentUser: User,
    conversationId: string,
    content: string,
  ): Promise<Message> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    if (!conversation) throw new NotFoundException();
    const [userRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (userRole.restrictions.length)
      throw new ForbiddenException(
        `Cannot post message to a conversation while you are ${
          userRole.restrictions[0].status === conversationRestrictionEnum.BAN
            ? 'banned'
            : 'muted'
        }`,
      );
    const newMessage = this.messageRepository.create({
      sender: currentUser,
      conversation: conversation,
      content: content,
    });
    await this.messageRepository.save(newMessage);
    userRole.lastRead = new Date();
    this.conversationRoleRepository.save(userRole);
    return newMessage;
  }

  async postPongInvitationMessage(
    currentUser: User,
    conversationId: string,
    content: string,
  ): Promise<Message> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    if (!conversation) throw new NotFoundException();
    const [userRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (userRole.restrictions.length)
      throw new ForbiddenException(
        `Cannot post message to a conversation while you are ${
          userRole.restrictions[0].status === conversationRestrictionEnum.BAN
            ? 'banned'
            : 'muted'
        }`,
      );
    const newMessage = this.messageRepository.create({
      system_generated: true,
      is_invitation: true,
      invitation_type: InvitationEnum.PONG,
      sender: currentUser,
      conversation: conversation,
      content: content,
    });
    await this.messageRepository.save(newMessage);
    userRole.lastRead = new Date();
    this.conversationRoleRepository.save(userRole);
    return newMessage;
  }

  async joinConversation(
    currentUser: User,
    conversationId: string,
    password: string | null,
  ): Promise<{ conversation: Conversation; joinMessage: Message | null }> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
      },
    });
    if (!conversation) throw new NotFoundException();
    const [currentUserRole] = conversation.conversationRoles.filter(
      (role) => role.user.id === currentUser.id,
    );
    if (currentUserRole) {
      if (
        currentUserRole.restrictions.filter(
          (restriction) =>
            restriction.status === conversationRestrictionEnum.BAN,
        ).length
      )
        throw new ForbiddenException(
          'You are not allowed to join a conversation from which you are banned',
        );
      if (currentUserRole.role === ConversationRoleEnum.LEFT) {
        currentUserRole.role = ConversationRoleEnum.USER;
        await this.conversationRoleRepository.save(currentUserRole);
      }
      return { conversation, joinMessage: null };
    }
    if (conversation.groupConversation === false)
      throw new ForbiddenException();
    if (conversation.password) {
      if (!password)
        throw new UnauthorizedException(
          'This conversation requires a password',
        );
      else if (!(await bcrypt.compare(password, conversation.password)))
        throw new ForbiddenException();
    }
    const joined = this.conversationRoleRepository.create({
      role: ConversationRoleEnum.USER,
      lastRead: new Date(),
      user: currentUser,
      conversation: conversation,
    });
    this.conversationRoleRepository.save(joined);
    const joinMessage = this.messageRepository.create({
      sender: null,
      conversation: conversation,
      content: `${currentUser.name} has joined the conversation`,
      system_generated: true,
    });
    this.messageRepository.save(joinMessage);
    return { conversation, joinMessage };
  }

  async getConversationParticipants(
    currentUser: User,
    conversationId: string,
  ): Promise<ConversationRole[]> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
        conversationRoles: {
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    if (!conversation) throw new NotFoundException();
    const [userRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (!userRole) throw new NotFoundException();
    const currentUserRestrictions = userRole.restrictions.filter(
      (restriction) => {
        return restriction.status === conversationRestrictionEnum.BAN;
      },
    );
    if (currentUserRestrictions.length)
      throw new ForbiddenException(
        'You are not allowed to see the participants of this conversation while you are banned',
      );
    return conversation.conversationRoles;
  }

  async createInvitation(
    currentUser: User,
    invitation: invitationDto,
    type: InvitationEnum,
    conversation: Conversation,
    targetName: string,
  ): Promise<Message> {
    const newMessage = this.messageRepository.create({
      sender: currentUser,
      conversation: conversation,
      content: targetName,
      system_generated: true,
      is_invitation: true,
      invitation_type: type,
      target: invitation.conversationID,
    });
    return this.messageRepository.save(newMessage);
  }

  async inviteToConversation(
    currentUser: User,
    invitation: invitationDto,
  ): Promise<{
    message: Message;
    conversation: Conversation | null;
    prevConversation: string | null;
  } | null> {
    const roles = await this.conversationRoleRepository.find({
      relations: {
        conversation: true,
      },
      where: {
        conversation: {
          id: invitation.conversationID,
        },
      },
    });
    const currentUserRole = roles.filter(
      (role) => role.user.id === currentUser.id,
    );
    if (currentUserRole.length === 0) {
      return null;
    }
    if (currentUserRole[0].restrictions.length) {
      return null;
    }
    if (currentUserRole[0].role === ConversationRoleEnum.LEFT) return null;
    if (roles.filter((role) => role.user.id === invitation.target).length !== 0)
      return null;
    const targetConversation = await this.conversationRepository.findOne({
      where: {
        id: invitation.conversationID,
        groupConversation: true,
      },
    });
    if (!targetConversation) return null;
    const conversationExists = await this.DMExists(
      currentUser,
      invitation.target,
    );
    if (
      conversationExists.conversationExists &&
      conversationExists.conversation
    ) {
      const message = await this.createInvitation(
        currentUser,
        invitation,
        InvitationEnum.CONVERSATION,
        conversationExists.conversation,
        targetConversation.name,
      );
      return {
        message: message,
        conversation: null,
        prevConversation: conversationExists.conversation.id,
      };
    }
    const conversation = await this.createConversation(
      {
        groupConversation: false,
        participant: invitation.target,
      } as createConversationDto,
      currentUser,
    );
    const message = await this.createInvitation(
      currentUser,
      invitation,
      InvitationEnum.CONVERSATION,
      conversation.conversation,
      targetConversation.name,
    );
    return {
      message: message,
      conversation: conversation.conversation,
      prevConversation: null,
    };
  }

  async canJoinConversation(currentUser: User, conversationId: string) {
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
      },
    });
    if (!conversation) return { canJoin: false, password: false };
    const userRole = conversation.conversationRoles.filter(
      (e) => e.user.id === currentUser.id,
    );
    if (userRole.length !== 0) {
      if (userRole.length) {
        const currentRestrictions = await this.verifyRestrictionsOnUser(
          userRole[0].restrictions,
        );
        if (currentRestrictions.length)
          return { canJoin: false, password: false };
        else if (userRole[0].role !== ConversationRoleEnum.LEFT)
          return { canJoin: false, password: false };
      }
    }
    return conversation.password
      ? { canJoin: true, password: true }
      : { canJoin: true, password: false };
  }

  async leaveConversation(
    currentUser: User,
    conversationId: string,
  ): Promise<{ userRole: ConversationRole; leftMessage: Message | null }> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: {
          conversation: true,
        },
        messages: true,
      },
      where: {
        id: conversationId,
      },
    });
    if (!conversation) throw new NotFoundException();
    const [userRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (!userRole) throw new ForbiddenException();
    if (conversation.groupConversation === false)
      throw new ForbiddenException('Cannot leave direct message conversation');
    if (conversation.conversationRoles.length === 1) {
      await this.messageRepository.remove(conversation.messages);
      await this.conversationRestrictionRepository.remove(
        userRole.restrictions,
      );
      await this.conversationRoleRepository.remove(userRole);
      await this.conversationRepository.remove(conversation);
      return { userRole, leftMessage: null };
    }
    if (userRole.role === ConversationRoleEnum.OWNER)
      throw new ForbiddenException(
        'Please pick a new owner for this conversation before leaving it',
      );
    const leftMessage = this.messageRepository.create({
      sender: null,
      conversation: conversation,
      content: `${currentUser.name} has left the conversation`,
      system_generated: true,
    });
    this.messageRepository.save(leftMessage);
    if (userRole.restrictions.length) {
      userRole.role = ConversationRoleEnum.LEFT;
      return {
        userRole: await this.conversationRoleRepository.save(userRole),
        leftMessage,
      };
    }
    return {
      userRole: await this.conversationRoleRepository.remove(userRole),
      leftMessage,
    };
  }

  async clearRestrictions(conversationId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
      },
    });
    if (!conversation) throw new NotFoundException();
    conversation.conversationRoles.forEach(async (role) => {
      const newRestrictions = await this.verifyRestrictionsOnUser(
        role.restrictions,
      );
      if (!newRestrictions.length && role.role === ConversationRoleEnum.LEFT)
        await this.conversationRoleRepository.remove(role);
    });
  }

  async verifyRestrictionsOnUser(
    restrictions: ConversationRestriction[],
  ): Promise<ConversationRestriction[]> {
    const time = new Date();
    const currentRestrictions: ConversationRestriction[] = [];

    restrictions.forEach(async (restriction) => {
      if (restriction.until && restriction.until.getTime() < time.getTime())
        await this.conversationRestrictionRepository.remove(restriction);
      else currentRestrictions.push(restriction);
    });
    return currentRestrictions;
  }

  async getUserRestrictionsOnConversation(
    target: User,
    conversationId: string,
  ): Promise<ConversationRestriction[]> {
    return await this.conversationRestrictionRepository.find({
      relations: {
        target: {
          conversation: true,
        },
      },
      where: {
        target: {
          conversation: {
            id: conversationId,
          },
          user: {
            id: target.id,
          },
        },
      },
    });
  }

  async restrictUser(
    currentUser: User,
    conversationId: string,
    username: string,
    restrictionType: conversationRestrictionEnum,
    until: Date | null,
  ): Promise<string> {
    await this.clearRestrictions(conversationId);
    if (until && until.getTime() < new Date().getTime())
      throw new ForbiddenException('Time is in the past');
    if (!until && restrictionType === conversationRestrictionEnum.MUTE)
      throw new ForbiddenException('Muting users requires a time');
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
        conversationRoles: {
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    if (!conversation) throw new NotFoundException();
    if (conversation.groupConversation === false)
      throw new ForbiddenException(
        'Cannot restrict other party in a direct message conversation',
      );
    const [currentUserRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (!currentUserRole)
      throw new ForbiddenException('No such conversation found');
    if (currentUserRole.restrictions.length)
      throw new ForbiddenException(
        'Cannot restrict other party while some restrictions are upon you',
      );
    const [targetUserRole] = conversation.conversationRoles.filter(
      (el) => el.user.name === username,
    );
    if (!targetUserRole)
      throw new NotFoundException('Target user not found in this conversation');
    if (
      currentUserRole.role === ConversationRoleEnum.USER ||
      targetUserRole.role === ConversationRoleEnum.OWNER ||
      (targetUserRole.role === ConversationRoleEnum.ADMIN &&
        currentUserRole.role !== ConversationRoleEnum.OWNER)
    )
      throw new ForbiddenException('You do not hold such power');
    const targetUserRestrictions = targetUserRole.restrictions;
    if (targetUserRestrictions.length) {
      for (const restriction of targetUserRestrictions) {
        if (
          restriction.status === conversationRestrictionEnum.MUTE &&
          restrictionType === conversationRestrictionEnum.MUTE
        ) {
          restriction.until = until;
          this.conversationRestrictionRepository.save(restriction);
          return `User muted until ${until}`;
        } else if (
          restriction.status === conversationRestrictionEnum.BAN &&
          restrictionType === conversationRestrictionEnum.BAN
        ) {
          restriction.until = until;
          this.conversationRestrictionRepository.save(restriction);
          return `User banned until ${until ? until : 'the end of times'}`;
        }
      }
    }
    const conversationRestriction =
      this.conversationRestrictionRepository.create({
        issuer: currentUser,
        target: targetUserRole,
        status: restrictionType,
        until: until,
      });
    this.conversationRestrictionRepository.save(conversationRestriction);
    return `User ${
      restrictionType === conversationRestrictionEnum.BAN ? 'banned' : 'muted'
    } until ${until ? until : 'the end of times'}`;
  }

  async kickUser(
    currentUser: User,
    conversationId: string,
    username: string,
  ): Promise<boolean> {
    await this.clearRestrictions(conversationId);
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: conversationId,
        conversationRoles: {
          role: Not(ConversationRoleEnum.LEFT),
        },
      },
    });
    if (!conversation) throw new NotFoundException();
    if (conversation.groupConversation === false)
      throw new ForbiddenException(
        'Cannot kick other party in a direct message conversation',
      );
    const [currentUserRole] = conversation.conversationRoles.filter(
      (el) => el.user.id === currentUser.id,
    );
    if (!currentUserRole)
      throw new ForbiddenException('No such conversation found');
    if (currentUserRole.restrictions.length)
      throw new ForbiddenException(
        'Cannot restrict other party while some restrictions are upon you',
      );
    const [targetUserRole] = conversation.conversationRoles.filter(
      (el) => el.user.name === username,
    );
    if (!targetUserRole)
      throw new NotFoundException('Target user not found in this conversation');
    if (
      currentUserRole.role === ConversationRoleEnum.USER ||
      targetUserRole.role === ConversationRoleEnum.OWNER ||
      (targetUserRole.role === ConversationRoleEnum.ADMIN &&
        currentUserRole.role !== ConversationRoleEnum.OWNER)
    )
      throw new ForbiddenException('You do not hold such power');
    await this.conversationRestrictionRepository.remove(
      targetUserRole.restrictions,
    );
    await this.conversationRoleRepository.remove(targetUserRole);
    return true;
  }

  async unbanUser(currentUser: User, target: muteUserDto) {
    await this.clearRestrictions(target.id);
    const currentConversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
        },
      },
    });
    if (!currentConversation) throw new NotFoundException();
    const targetUser = await this.conversationRoleRepository.findOne({
      relations: {
        conversation: true,
      },
      where: {
        user: {
          name: target.username,
        },
        conversation: {
          id: target.id,
        },
      },
    });
    if (!targetUser) throw new NotFoundException();
    const banRestrictions: ConversationRestriction[] = [];
    targetUser.restrictions.forEach((restriction) => {
      if (restriction.status === conversationRestrictionEnum.BAN)
        banRestrictions.push(restriction);
    });
    if (banRestrictions.length) {
      await this.conversationRestrictionRepository.remove(banRestrictions);
    }
    return true;
  }

  async unmuteUser(currentUser: User, target: muteUserDto) {
    await this.clearRestrictions(target.id);
    const currentConversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
        },
      },
    });
    if (!currentConversation) throw new NotFoundException();
    const targetUser = await this.conversationRoleRepository.findOne({
      relations: {
        conversation: true,
      },
      where: {
        user: {
          name: target.username,
        },
        conversation: {
          id: target.id,
        },
      },
    });
    if (!targetUser) throw new NotFoundException();
    const banRestrictions: ConversationRestriction[] = [];
    targetUser.restrictions.forEach((restriction) => {
      if (restriction.status === conversationRestrictionEnum.MUTE)
        banRestrictions.push(restriction);
    });
    if (banRestrictions.length) {
      await this.conversationRestrictionRepository.remove(banRestrictions);
    }
    return true;
  }

  async readMessage(
    currentUser: User,
    conversationId: string,
  ): Promise<boolean> {
    const conversationRole = await this.conversationRoleRepository.findOne({
      relations: {
        conversation: true,
      },
      where: {
        user: {
          id: currentUser.id,
        },
        conversation: {
          id: conversationId,
        },
      },
    });
    if (!conversationRole) throw new NotFoundException();
    conversationRole.lastRead = new Date();
    this.conversationRoleRepository.save(conversationRole);
    return true;
  }
  async blockExists(sourceId: string, targetId: string): Promise<boolean> {
    return (
      (await this.blocksRepository.findOneBy({
        source: { id: sourceId },
        target: { id: targetId },
      })) !== null
    );
  }

  async getBlockedUsers(sourceId: string): Promise<Block[]> {
    return this.blocksRepository.findBy({ source: { id: sourceId } });
  }

  async blockUser(source: User, target: User): Promise<Block> {
    const block = new Block();
    block.source = source;
    block.target = target;
    return this.blocksRepository.save(block);
  }

  async unblockUser(sourceId: string, targetId: string): Promise<DeleteResult> {
    return this.blocksRepository.delete({
      source: { id: sourceId },
      target: { id: targetId },
    });
  }

  async changeVisibility(currentUser: User, id: string, visible: boolean) {
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: id,
        groupConversation: true,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: ConversationRoleEnum.OWNER,
        },
      },
    });
    if (!conversation) throw new NotFoundException();
    conversation.visible = visible;
    await this.conversationRepository.save(conversation);
    return true;
  }

  async addPassword(
    currentUser: User,
    addConversationPasswordDto: addConversationPasswordDto,
  ) {
    if (
      addConversationPasswordDto.password !==
      addConversationPasswordDto.confirmationPassword
    )
      throw new NotFoundException();
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: addConversationPasswordDto.id,
        groupConversation: true,
        has_password: false,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: ConversationRoleEnum.OWNER,
        },
      },
    });
    if (!conversation) throw new NotFoundException();
    const salt = await bcrypt.genSalt();
    conversation.password = await bcrypt.hash(
      addConversationPasswordDto.password,
      salt,
    );
    conversation.has_password = true;
    await this.conversationRepository.save(conversation);
    if (conversation.visible) return true;
    return false;
  }

  async updatePassword(
    currentUser: User,
    updateConversationPasswordDto: updateConversationPasswordDto,
  ) {
    if (
      updateConversationPasswordDto.password !==
      updateConversationPasswordDto.confirmationPassword
    )
      throw new NotFoundException();
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: updateConversationPasswordDto.id,
        groupConversation: true,
        has_password: true,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: ConversationRoleEnum.OWNER,
        },
      },
    });
    if (!conversation || !conversation.password) throw new NotFoundException();
    if (
      !(await bcrypt.compare(
        updateConversationPasswordDto.oldPassword,
        conversation.password,
      ))
    )
      throw new ForbiddenException();
    const salt = await bcrypt.genSalt();
    conversation.password = await bcrypt.hash(
      updateConversationPasswordDto.password,
      salt,
    );
    await this.conversationRepository.save(conversation);
    return true;
  }

  async removePassword(
    currentUser: User,
    removeConversationPasswordDto: removeConversationPasswordDto,
  ) {
    const conversation = await this.conversationRepository.findOne({
      relations: {
        conversationRoles: true,
      },
      where: {
        id: removeConversationPasswordDto.id,
        groupConversation: true,
        has_password: true,
        conversationRoles: {
          user: {
            id: currentUser.id,
          },
          role: ConversationRoleEnum.OWNER,
        },
      },
    });
    if (!conversation) {
      console.error('No conversation found');
      throw new NotFoundException();
    }
    if (!conversation.password) {
      console.error('COnversation does not have a password');
      throw new NotFoundException();
    }
    console.error('So far so good');
    if (
      !(await bcrypt.compare(
        removeConversationPasswordDto.password,
        conversation.password,
      ))
    )
      throw new ForbiddenException();
    conversation.password = null;
    conversation.has_password = false;
    await this.conversationRepository.save(conversation);
    if (conversation.visible) return true;
    return false;
  }

  // else if (!(await bcrypt.compare(password, conversation.password)))
  // throw new ForbiddenException();
}
