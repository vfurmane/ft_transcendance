import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable
  } from "typeorm";
  import { User } from "./user.entity";
  
  @Entity()
  export class Achievements {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
    
    @Column("varchar", { length: 30, unique: true })
    title!: string;

    @Column("varchar", { length: 300 })
    description!: string;

    @Column("varchar", { length: 30, unique: true })
    logo!: string;

    /*@ManyToMany(() => User)
    @JoinTable()
    users!: User[]*/

    @ManyToOne(() => User, (user) => user.achievements)
    user!: User | null;
  
    @CreateDateColumn()
    created_at!: Date;
  }