import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';

  @Entity()
  export class MatchEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(()=> User)
    @JoinColumn()
    winner_id!: User;

    @OneToOne(()=> User)
    @JoinColumn()
    looser_id!: User;

    @Column('number', {default: 0})
    score_winner!: number;
  
    @Column('number', {default: 0})
    score_looser!: number;

    @CreateDateColumn()
    created_at!: Date;
}