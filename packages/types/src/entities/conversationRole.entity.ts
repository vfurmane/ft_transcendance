import { User } from './user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { ConversationRoleEnum } from '../enums/conversationRole.enum';
import { Exclude, Expose } from 'class-transformer';
import { ConversationRestriction } from './conversationRestriction.entity';

@Expose()
@Entity()
export class ConversationRole {
  @Exclude()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ConversationRoleEnum,
    default: ConversationRoleEnum.USER,
  })
  role!: ConversationRoleEnum;

  @Column()
  lastRead!: Date;

  @ManyToOne(() => User, (user) => user.conversationRoles, { eager: true })
  user!: User;

  @ManyToOne(
    () => Conversation,
    (conversation) => conversation.conversationRoles,
  )
  conversation!: Conversation;

  @OneToMany(
    () => ConversationRestriction,
    (conversationRestriction) => conversationRestriction.target,
    { eager: true, cascade: true },
  )
  restrictions!: ConversationRestriction[];
}
