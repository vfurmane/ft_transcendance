import { User } from "./user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TokenTypeEnum } from "../enums/token-type.enum";

@Entity()
export class Jwt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.jwts, { eager: true })
  user!: User;

  @Column({
    type: "enum",
    enum: TokenTypeEnum,
    default: TokenTypeEnum.ACCESS_TOKEN,
  })
  token_type!: TokenTypeEnum;

  @Column("boolean", { default: false })
  consumed!: boolean;

  @ManyToOne(() => Jwt, (jwt) => jwt.id, { eager: false, nullable: true })
  originToken!: Jwt | null;
}
