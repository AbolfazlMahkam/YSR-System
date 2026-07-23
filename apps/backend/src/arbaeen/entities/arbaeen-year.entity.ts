import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('arbaeen_years')
export default class ArbaeenYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  year: string;

  @CreateDateColumn()
  created_at: Date;
}
