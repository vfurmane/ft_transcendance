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
  export class Achivements {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
    
    @Column("varchar", { length: 30, unique: true })
    title!: string;

    @Column("varchar", { length: 300 })
    description!: string;

    /*@ManyToMany(() => User)
    @JoinTable()
    users!: User[]*/

    @ManyToOne(() => User, (user) => user.achivements)
    user!: User;
  
    @CreateDateColumn()
    created_at!: Date;
  }