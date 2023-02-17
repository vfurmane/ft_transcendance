import { State } from "./state.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";
import { Message } from "./message.entity";
import { ConversationRole } from "./conversationRole.entity";
import { Match } from "./match.entity";
import { Jwt } from "./jwt.entity";
import { JwtPayload } from "..";
import { Opponent } from "./opponent.entity";
import { Profile } from './profile.entity';
import { Achievements } from "./Achievements.entity";

@Exclude()
@Entity()
export class User {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Expose()
  @OneToMany(() => State, (state) => state.user)
  states!: State[];

  @Column("varchar", { length: 255, unique: true })
  email!: string;

  @Expose()
  @Column("varchar", { length: 30, unique: true })
  name!: string;

  @Column("varchar", { length: 255, nullable: true })
  password!: string | null;

  @Column("varchar", { length: 255, nullable: true })
  tfa_secret!: string | null;

  @Column("boolean", { default: false })
  tfa_setup!: boolean;

  @Expose()
  @OneToMany(() => Message, (message) => message.sender)
  messages!: Message[];

  @Expose()
  @OneToMany(
    () => ConversationRole,
    (conversationRole) => conversationRole.user
  )
  conversationRoles!: ConversationRole[];

  @Expose()
  @OneToMany(() => Match, (match) => match.winner_id)
  win!: Match[];

  @Expose()
  @OneToMany(() => Match, (match) => match.looser_id)
  defeat!: Match[];

  @Column("smallint", { default: 0 })
  level!: number;
  
  @OneToMany(() => Jwt, (jwt) => jwt.user)
  jwts!: Jwt[];

  @OneToMany(() => Opponent, (opponent) => opponent.user)
  opponents!: Opponent[];

  currentJwt!: JwtPayload;

  @OneToMany(() => Achievements, (achievement) => achievement.user)
  achievements!: Achievements[];
  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile!: Profile;
}
