import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Exclude, Expose } from "class-transformer";
import { User } from "./user.entity";

@Exclude()
@Entity()
export class Block {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Expose()
  @ManyToOne(() => User, (user) => user.blocks, { eager: true })
  source!: User;

  @Expose()
  @ManyToOne(() => User, (user) => user.beenBlocked, { eager: true })
  target!: User;
}
