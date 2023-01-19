import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Friendships {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50 })
  initiator_id!: string;

  @Column('varchar', { length: 50 })
  target_id!: string;

  @Column('boolean', { default: false })
  accepted!: boolean;
}