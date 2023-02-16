import { User } from "./user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Opponent } from "./opponent.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Opponent, (opponent) => opponent.game, { eager: true })
  opponents!: Opponent[];
}
