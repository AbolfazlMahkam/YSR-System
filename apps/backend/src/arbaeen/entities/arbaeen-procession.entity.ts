import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import ArbaeenYear from './arbaeen-year.entity';

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

  @CreateDateColumn()
  created_at: Date;
}
