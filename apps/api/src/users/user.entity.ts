import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Exclude()
  @CreateDateColumn()
  created_at!: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at!: Date;

  @Column('varchar', { length: 255, unique: true })
  email!: string;

  @Column('varchar', { length: 30, unique: true })
  name!: string;

  @Exclude()
  @Column('varchar', { length: 255, nullable: true })
  password!: string | null;
}
