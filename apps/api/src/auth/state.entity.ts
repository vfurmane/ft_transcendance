import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class State {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Exclude()
  @CreateDateColumn()
  created_at!: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at!: Date;

  @Column('varchar', { length: 255, unique: true })
  token!: string;
}
