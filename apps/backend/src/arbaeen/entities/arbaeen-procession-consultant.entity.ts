import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import ArbaeenProcession from './arbaeen-procession.entity';
import Users from '../../entities/user.entity';

@Entity('arbaeen_procession_consultants')
@Unique(['procession_id', 'user_id'])
export default class ArbaeenProcessionConsultant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  procession_id: number;

  @ManyToOne(() => ArbaeenProcession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'procession_id' })
  procession: ArbaeenProcession;

  @Column()
  user_id: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @CreateDateColumn()
  created_at: Date;
}
