import { Expose, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Conversation } from './conversation.entity';

@Expose()
@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.messages, {eager: true})
  sender!: User

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation!: Conversation

  @Column("text")
  content!: string

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
