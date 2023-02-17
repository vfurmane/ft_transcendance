import { Expose } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Conversation } from "./conversation.entity";
import { InvitationEnum } from "../enums";

@Expose()
@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.messages, {
    eager: true,
    nullable: true,
  })
  sender!: User | null;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation!: Conversation;

  @Column("text")
  content!: string;

  @Column("boolean", { default: false })
  system_generated!: boolean;

  @Column("boolean", { default: false} )
  is_invitation!: boolean

  @Column({
    type: "enum",
    enum: InvitationEnum,
    default: InvitationEnum.CONVERSATION
  })
  invitation_type!: InvitationEnum

  @Column("uuid", { nullable: true, default: null})
  target!: string | null

  @Column("boolean", { default: false })
  has_password!: boolean

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
