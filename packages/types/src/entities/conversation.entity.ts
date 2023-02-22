import { Exclude, Expose } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ConversationRole } from "./conversationRole.entity";
import { Message } from "./message.entity";

@Expose()
@Entity()
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ default: false })
  groupConversation!: boolean;

  @Exclude()
  @Column("varchar", { length: 255, nullable: true, default: null })
  password!: string | null;

  @Column("boolean", { default: false })
  has_password!: boolean;

  @Column("boolean", { default: false })
  visible!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages!: Message[];

  @OneToMany(
    () => ConversationRole,
    (conversationRole) => conversationRole.conversation,
    { cascade: true }
  )
  conversationRoles!: ConversationRole[];
}
