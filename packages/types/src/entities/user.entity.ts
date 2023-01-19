import { State } from './state.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Message } from './message.entity';
import { ConversationRole } from './conversationRole.entity';

@Exclude()
@Entity()
export class User {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Expose()
  @OneToMany(() => State, (state) => state.user)
  states!: State[];

  @Column('varchar', { length: 255, unique: true })
  email!: string;

  @Expose()
  @Column('varchar', { length: 30, unique: true })
  name!: string;

  @Column('varchar', { length: 255, nullable: true })
  password!: string | null;

  @Column('varchar', { length: 255, nullable: true })
  tfa_secret!: string | null;

  @Column('boolean', { default: false })
  tfa_setup!: boolean;

  @Expose()
  @OneToMany(() => Message, (message) => message.sender)
  messages!: Message[];

  @Expose()
  @OneToMany(
    () => ConversationRole,
    (conversationRole) => conversationRole.user,
  )
  conversationRoles!: ConversationRole[];
  @Column('number', {default: 0})
  level!: number;
}
