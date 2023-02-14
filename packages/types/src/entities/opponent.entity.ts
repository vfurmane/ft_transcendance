import { User } from "./user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Game } from "./game.entity";

@Entity()
export class Opponent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
  
  @Column("smallint", { default: 0 })
  score!: number;

  @ManyToOne(() => User, (user) => user.opponents)
  user!: User;

  @ManyToOne(() => Game, (game) => game.opponents)
  game!: Game;
}
