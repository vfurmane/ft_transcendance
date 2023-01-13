import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { MoreThan, Not, Repository, RepositoryNotTreeError } from 'typeorm';
import { unreadMessagesResponse } from 'types';
import { Conversation } from './entities/conversation.entity';
import { ConversationRoleEnum } from './conversationRole.enum';
import { ConversationRole } from './entities/conversationRole.entity';
import { createConversationDto } from './dtos/createConversation.dto';
import { updateRoleDto } from './dtos/updateRole.dto';
import { Message } from './entities/message.entity';
import * as bcrypt from 'bcrypt';
import { conversationRestrictionEnum } from './conversationRestriction.enum';
import { ConversationRestriction } from './entities/conversationRestriction.entity';

@Injectable()
export class ConversationsService {
    constructor(
        @InjectRepository(Conversation) private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(ConversationRole) private readonly conversationRoleRepository: Repository<ConversationRole>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
        @InjectRepository(ConversationRestriction) private readonly conversationRestrictionRepository: Repository<ConversationRestriction>
    ) {}

    async getListOfDMs(user: User): Promise<Conversation[]>
    {
        let listOfDMs: Conversation[] = [];
        let conversationRolesList = await this.conversationRoleRepository.find({
            relations: {
                user: true,
                conversation: true
            },
            where: {
                user: {
                    id: user.id
                },
                conversation: {
                    groupConversation: false
                }
            }
        })
        for (let conversationRole of conversationRolesList)
        {
            listOfDMs.push(conversationRole.conversation);
        }
        return (listOfDMs);
    }

    async createConversation(newConversation : createConversationDto, creator: User): Promise<Conversation>
    {
        let users : User[] = [];
        if (newConversation.participants.length === 0)
            throw new BadRequestException("Unable to create conversation, missing participants list");
        if (newConversation.groupConversation === false && newConversation.participants.length !== 1)
            throw new BadRequestException("Direct messages cannot involve more than one two participants");
            if (newConversation.groupConversation === false && newConversation.password)
            throw new BadRequestException("Direct messages cannot be password protected");
        if (newConversation.groupConversation === true && !newConversation.name)
        {
            throw new BadRequestException("Please provide a name for your new group conversation");
        }
        for (const participant of newConversation.participants)
        {
            let currentUser = await this.userRepository.findOne({where: {
                id: participant,
            }})
            if (!currentUser)
            {
                throw new BadRequestException("Some participants do not exist");
            }
            if (currentUser.id === creator.id)
            {
                throw new BadRequestException("You cannot have a conversation with yourself");
            }
            users.push(currentUser);
        }
        if (!newConversation.groupConversation)
        {
            let creatorDMs = await this.getListOfDMs(creator);
            let recipientDMs = await this.getListOfDMs(users[0]);
            for (let creatorDM of creatorDMs)
            {
                if (recipientDMs.filter(el => el.id === creatorDM.id).length)
                    return (creatorDM);
            }
        }
        const createdConversation = this.conversationRepository.create(newConversation);
        if (!newConversation.groupConversation)
        {
            createdConversation.name = `${creator.name} - ${users[0].name}`;
        }
        if (createdConversation.password)
        {
            const salt = await bcrypt.genSalt();
            createdConversation.password =  await bcrypt.hash(createdConversation.password, salt);
        }
        await this.conversationRepository.save(createdConversation);
        if (newConversation.groupConversation === false)
        {
            let conversationRole = this.conversationRoleRepository.create({lastRead: new Date(), role: ConversationRoleEnum.ADMIN, user: users[0], conversation: createdConversation})
            await this.conversationRoleRepository.save(conversationRole);
        }
        else
        {
            for (let currentUser of users)
            {
                let conversationRole = this.conversationRoleRepository.create({lastRead: new Date(), role: ConversationRoleEnum.USER, user: currentUser, conversation: createdConversation})
                await this.conversationRoleRepository.save(conversationRole);
            } 
        }
        const conversationRole = this.conversationRoleRepository.create({lastRead: new Date(), role: ConversationRoleEnum.OWNER, user: creator, conversation: createdConversation})
        await this.conversationRoleRepository.save(conversationRole);

        return (createdConversation);
    }

    async updateRole(conversationId: string, newRole: updateRoleDto, currentUser: User): Promise<boolean>
    {
        await this.clearRestrictions(conversationId);
        const conversation = await this.conversationRepository.findOne({
            relations:
            {
                conversationRoles: true
            },
            where:
            {
                id : conversationId,
                conversationRoles:
                {
                    role: Not(ConversationRoleEnum.LEFT)
                }
            }});
        if (!conversation)
            throw new NotFoundException("Conversation could not be found");
        const [currentUserRole] = conversation.conversationRoles.filter(el => el.user.id === currentUser.id)
        if (!currentUserRole)
            throw new ForbiddenException("You are not part of such a conversation");
        if (currentUserRole.restrictions.length)
            throw new ForbiddenException("Cannot update roles while you have some restrictions upon you");
        const [targetUserRole] = conversation.conversationRoles.filter(el => el.user.id === newRole.userId)
        if (!targetUserRole)
            throw new ForbiddenException("The targeted user is not part of such a conversation");
        if (targetUserRole.id === currentUserRole.id)
        {
            if (!(newRole.newRole === ConversationRoleEnum.USER && currentUserRole.role === ConversationRoleEnum.ADMIN))
                throw new ForbiddenException("You are not allowed to change your role in this conversation")
            currentUserRole.role = ConversationRoleEnum.USER;
            this.conversationRoleRepository.save(currentUserRole);
            return (true)
        }
        switch (currentUserRole.role)
        {
            case ConversationRoleEnum.OWNER:
                if (newRole.newRole === ConversationRoleEnum.OWNER)
                {
                    targetUserRole.role = ConversationRoleEnum.OWNER
                    currentUserRole.role = ConversationRoleEnum.ADMIN
                    this.conversationRoleRepository.save(currentUserRole);
                }
                else if (newRole.newRole === ConversationRoleEnum.ADMIN)
                {
                    if (targetUserRole.role !== ConversationRoleEnum.USER)
                        throw new ForbiddenException("This user is already an administrator of this conversation")
                    targetUserRole.role = ConversationRoleEnum.ADMIN
                }
                else
                {
                    if (targetUserRole.role === ConversationRoleEnum.USER)
                        throw new ForbiddenException("This user is already a regular user")
                    targetUserRole.role = ConversationRoleEnum.USER;
                }
                break;
            case ConversationRoleEnum.ADMIN:
                if (targetUserRole.role !== ConversationRoleEnum.USER)
                    throw new ForbiddenException("You are not allowed to mofidy the role of this user");
                if (newRole.newRole !== ConversationRoleEnum.ADMIN)
                    throw new ForbiddenException("You are not allowed to make this update")
                targetUserRole.role = ConversationRoleEnum.ADMIN
                break;
            default:
                throw new ForbiddenException("You are not allowed to make changes in this conversation")
                break;
        }
        this.conversationRoleRepository.save(targetUserRole);
        return (true);
    }

    async getConversations(currentUser: User): Promise<Conversation[]>
    {
        let conversations : Conversation[] = [];
        const fullUser = await this.userRepository.findOne({
            relations: 
            {
                conversationRoles: {
                    conversation: true
                }
            },
            where:
            {
                id: currentUser.id,
            }
        })
        if (!fullUser)
        {
            throw new NotFoundException();
        }
        for (let conversationRole of fullUser.conversationRoles.filter((role) => role.role !== ConversationRoleEnum.LEFT))
        {
            await this.clearRestrictions(conversationRole.conversation.id);
            conversations.push(conversationRole.conversation);
        }
        return (conversations);
    }

    async getMessages(currentUser: User, conversationId: string): Promise<Message[]>
    {
        await this.clearRestrictions(conversationId);
        const conversation = await this.conversationRepository.findOne({
            relations: 
            {
                conversationRoles: true,
                messages:
                {
                    sender: true
                }
            },
            where:
            {
                id: conversationId,
                conversationRoles : {
                    user: {
                        id : currentUser.id
                    },
                    role: Not(ConversationRoleEnum.LEFT)
                }
            }
        })
        if (!conversation)
        {
            throw new NotFoundException();
        }
        const [userRole] = conversation.conversationRoles.filter(el => el.user.id === currentUser.id)
        if (userRole.restrictions.filter((restriction) => restriction.status === conversationRestrictionEnum.BAN).length)
            throw new ForbiddenException("Cannot get messages from a conversation from which you have been banned");
        userRole.lastRead = new Date()
        this.conversationRoleRepository.save(userRole);
        return (conversation.messages);
    }


    async unreadCount(currentUser: User): Promise<unreadMessagesResponse>
    {
        let response : unreadMessagesResponse = {totalNumberOfUnreadMessages: 0, UnreadMessage: []}
        const conversationRoles = await this.conversationRoleRepository.find({
            relations:
            {
                conversation: true
            },
            where: {
                user:
                {
                    id: currentUser.id
                },
                role: Not(ConversationRoleEnum.LEFT)
            }
        }
        )
        if (!conversationRoles.length)
        {
            return (response)
        }
        for (let role of conversationRoles)
        {
            if ((await this.verifyRestrictionsOnUser(role.restrictions)).filter((restriction) => restriction.status === conversationRestrictionEnum.BAN).length)
                continue ;
            const unreadMessages = await this.messageRepository.findAndCount({
                relations:
                {
                    conversation: true
                },
                where:
                {
                    created_at: MoreThan(role.lastRead),
                    conversation:
                    {
                        id : role.conversation.id
                    }
                }
            })
            if (unreadMessages[1])
            {
                response.totalNumberOfUnreadMessages += unreadMessages[1];
                response.UnreadMessage.push({conversationId: unreadMessages[0][0].conversation.id, name: unreadMessages[0][0].conversation.name, numberOfUnreadMessages: unreadMessages[1]})
            }
        }
        return (response);
    }

    async postMessage(currentUser: User, conversationId: string, content: string)
    {
        await this.clearRestrictions(conversationId);
        let conversation = await this.conversationRepository.findOne(
            {
                relations:
                {
                    conversationRoles: true                    
                },
                where:
                {
                    id: conversationId,
                    conversationRoles:
                    {
                        user:
                        {
                            id: currentUser.id
                        },
                        role: Not(ConversationRoleEnum.LEFT)
                    }
                }
            }
        )
        if (!conversation)
            throw new NotFoundException()
        const [userRole] = conversation.conversationRoles.filter(el => el.user.id === currentUser.id)
        if (userRole.restrictions.length)
            throw new ForbiddenException(`Cannot post message to a conversation while you are ${userRole.restrictions[0].status === conversationRestrictionEnum.BAN ? 'banned' : 'muted'}`);
        const newMessage = this.messageRepository.create({sender: currentUser, conversation: conversation, content: content});
        await this.messageRepository.save(newMessage);
        userRole.lastRead = new Date()
        this.conversationRoleRepository.save(userRole);
        return (true)
    }

    async joinConversation(currentUser: User, conversationId: string, password: string | null)
    {
        await this.clearRestrictions(conversationId);
        const conversation = await this.conversationRepository.findOne({
            relations:
            {
                conversationRoles: true
            },
            where: {
                id: conversationId
            }
        });
        if (!conversation)
            throw new NotFoundException()
        let [currentUserRole] = conversation.conversationRoles.filter((role) => role.user.id === currentUser.id)
        if (currentUserRole)
        {
            if (currentUserRole.restrictions.filter((restriction) => restriction.status === conversationRestrictionEnum.BAN).length)
                throw new ForbiddenException("You are not allowed to join a conversation from which you are banned");
            if (currentUserRole.role === ConversationRoleEnum.LEFT)
            {
                currentUserRole.role = ConversationRoleEnum.USER
                await this.conversationRoleRepository.save(currentUserRole)
            }
            return (conversation);
        }
        if (conversation.groupConversation === false)
            throw new ForbiddenException()
        if (conversation.password)
        {
            if (!password)
                throw new UnauthorizedException("This conversation requires a password")
            else if (!(await bcrypt.compare(password, conversation.password)))
                throw new ForbiddenException();
        }
        const joined = this.conversationRoleRepository.create({role: ConversationRoleEnum.USER, lastRead: new Date(), user: currentUser, conversation: conversation});
        this.conversationRoleRepository.save(joined);
        return (conversation)
    }

    async getConversationParticipants(currentUser: User, conversationId: string)
    {
        await this.clearRestrictions(conversationId);
        const conversation = await this.conversationRepository.findOne({
            relations:
            {
                conversationRoles: true
            },
            where: {
                id: conversationId,
                conversationRoles:
                {
                    role: Not(ConversationRoleEnum.LEFT)
                }
            }
        });
        if (!conversation)
            throw new NotFoundException()
        const [userRole] = conversation.conversationRoles.filter(el => el.user.id === currentUser.id)
        if (!userRole)
            throw new NotFoundException()
        let currentUserRestrictions = userRole.restrictions.filter((restriction) => {
            return restriction.status === conversationRestrictionEnum.BAN
        });
        if (currentUserRestrictions.length)
                throw new ForbiddenException("You are not allowed to see the participants of this conversation while you are banned")
        return (conversation.conversationRoles)
    }

    async leaveConversation(currentUser: User, conversationId: string)
    {
        await this.clearRestrictions(conversationId);
        const conversation = await this.conversationRepository.findOne({
            relations:
            {
                conversationRoles:
                {
                    conversation: true
                }
            },
            where: {
                id: conversationId
            }
        });
        if (!conversation)
            throw new NotFoundException();
        const [userRole] = conversation.conversationRoles.filter((el) => el.user.id === currentUser.id)
        if (!userRole)
            throw new ForbiddenException()
        if (conversation.groupConversation === false)
            throw new ForbiddenException("Cannot leave direct message conversation")
        if (conversation.conversationRoles.length === 1)
        {
            await this.conversationRoleRepository.remove(userRole);
            await this.conversationRepository.remove(conversation);
            return userRole;
        }
        if (userRole.role === ConversationRoleEnum.OWNER)
            throw new ForbiddenException("Please pick a new owner for this conversation before leaving it")
        if (userRole.restrictions.length)
        {
            userRole.role = ConversationRoleEnum.LEFT
            return await this.conversationRoleRepository.save(userRole)
        }
        return  await this.conversationRoleRepository.remove(userRole);
    }

    async clearRestrictions(conversationId: string)
    {
        const time = new Date()
        const conversation = await this.conversationRepository.findOne(
            {
                relations:
                {
                    conversationRoles: true,
                },
                where:
                {
                    id: conversationId
                }
            }
        )
        if (!conversation)
            throw new NotFoundException()
        conversation.conversationRoles.forEach(async (role) =>
        {
            let newRestrictions = await this.verifyRestrictionsOnUser(role.restrictions);
            if (!newRestrictions.length && role.role === ConversationRoleEnum.LEFT)
                await this.conversationRoleRepository.remove(role);
        })
    }

    async verifyRestrictionsOnUser(restrictions: ConversationRestriction[])
    {
        const time = new Date()
        let currentRestrictions: ConversationRestriction[] = [];

        restrictions.forEach(async (restriction) =>
        {
            if (restriction.until && restriction.until.getTime() < time.getTime())
                await this.conversationRestrictionRepository.remove(restriction)
            else
                currentRestrictions.push(restriction)      
        })
        return (currentRestrictions);
    }

    async   getUserRestrictionsOnConversation(target: User, conversationId: string)
    {
        return (await this.conversationRestrictionRepository.find(
            {
                relations:
                {
                        target:
                        {
                            conversation: true
                        }
                },
                where:
                {
                    target:
                    {
                        conversation:
                        {
                            id: conversationId
                        },
                        user:
                        {
                            id: target.id
                        }
                    }
                }
            }
        ));
    }

    async restrictUser(currentUser: User, conversationId: string, username: string, restrictionType: conversationRestrictionEnum, until: Date | null)
    {
        await this.clearRestrictions(conversationId)
        if (until && until.getTime() < (new Date()).getTime())
            throw new ForbiddenException("Time is in the past")
        if (!until && restrictionType === conversationRestrictionEnum.MUTE)
            throw new ForbiddenException("Muting users requires a time")
        const conversation = await this.conversationRepository.findOne(
            {
                relations:
                {
                    conversationRoles: true,
                },
                where:
                {
                    id: conversationId,
                    conversationRoles:
                    {
                        role: Not(ConversationRoleEnum.LEFT)
                    }
                }
            }
        )
        if (!conversation)
            throw new NotFoundException()
        if (conversation.groupConversation === false)
            throw new ForbiddenException("Cannot restrict other party in a direct message conversation")
        const [currentUserRole] = conversation.conversationRoles.filter( (el) => el.user.id === currentUser.id );
        if (!currentUserRole)
            throw new ForbiddenException("No such conversation found")
        if (currentUserRole.restrictions.length)
            throw new ForbiddenException("Cannot restrict other party while some restrictions are upon you")
        const [targetUserRole] = conversation.conversationRoles.filter( (el) => el.user.name === username );
        if (!targetUserRole)
            throw new NotFoundException("Target user not found in this conversation")
        if (currentUserRole.role === ConversationRoleEnum.USER || targetUserRole.role === ConversationRoleEnum.OWNER
            || (targetUserRole.role === ConversationRoleEnum.ADMIN && currentUserRole.role !== ConversationRoleEnum.OWNER))
            throw new ForbiddenException("You do not hold such power")
        const targetUserRestrictions = targetUserRole.restrictions
        if (targetUserRestrictions.length)
        {
            for (let restriction of targetUserRestrictions)
            {
                if (restriction.status === conversationRestrictionEnum.MUTE && restrictionType === conversationRestrictionEnum.MUTE)
                {
                    restriction.until = until;
                    this.conversationRestrictionRepository.save(restriction)
                    return `User muted until ${until}`
                }
                else if (restriction.status === conversationRestrictionEnum.BAN && restrictionType === conversationRestrictionEnum.BAN)
                {
                    restriction.until = until;
                    this.conversationRestrictionRepository.save(restriction)
                    return `User banned until ${until ? until : "the end of times"}`
                }
            }
        }
        let conversationRestriction = this.conversationRestrictionRepository.create({issuer: currentUser, target: targetUserRole, status: restrictionType, until: until})
        this.conversationRestrictionRepository.save(conversationRestriction)
        return `User ${restrictionType === conversationRestrictionEnum.BAN ? "banned" : "muted"} until ${until ? until : "the end of times"}`
    }
}