import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

  @Entity()
  export class Match {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @ManyToOne(() => User, (user) => user.win)
    winner_id!: User;

    @ManyToOne(() => User, (user) => user.defeat)
    looser_id!: User;

    @Column('smallint', {default: 0})
    score_winner!: number;
  
    @Column('smallint', {default: 0})
    score_looser!: number;

    @CreateDateColumn()
    created_at!: Date;
}