import { Exclude, Expose } from "class-transformer";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Expose()
@Entity()
export class Friendships {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { eager: true })
  initiator!: User;

  @ManyToOne(() => User, { eager: true })
  target!: User;

  @Column("boolean", { default: false })
  accepted!: boolean;
}
