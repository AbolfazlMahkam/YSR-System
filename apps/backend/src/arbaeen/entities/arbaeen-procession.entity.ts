import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import ArbaeenYear from './arbaeen-year.entity';
import Users from '../../entities/user.entity';

@Entity('arbaeen_processions')
export default class ArbaeenProcession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year_id: number;

  @ManyToOne(() => ArbaeenYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'year_id' })
  year: ArbaeenYear;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  location: 'Najaf Ashraf' | "Karbala Mu'alla" | 'Tariq Al-Hussein (AS)';

  @Column('text')
  address: string;

  @Column()
  responsible_name: string;

  @Column()
  responsible_phone: string;

  @Column({ type: 'varchar' })
  gender_requirement: 'male' | 'female' | 'both';

  @Column({ nullable: true })
  responsible_consultant_id: number | null;

  @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'responsible_consultant_id' })
  responsible_consultant: Users | null;

  @CreateDateColumn()
  created_at: Date;
}
