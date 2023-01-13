import { Exclude, Expose } from "class-transformer";
import { User } from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { conversationRestrictionEnum } from "../conversationRestriction.enum";
import { ConversationRole } from "./conversationRole.entity";

@Exclude()
@Entity()
export class ConversationRestriction
{
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @ManyToOne(() => User, {eager: true})
    issuer!: User

    @ManyToOne(() => ConversationRole, (conversationRole) => conversationRole.restrictions)
    target!: ConversationRole

    @Expose()
    @Column({
        type: "enum",
        enum: conversationRestrictionEnum,
    })
    status!: conversationRestrictionEnum

    @Expose()
    @Column({ type: 'timestamptz', nullable: true })
    until!: Date | null
}