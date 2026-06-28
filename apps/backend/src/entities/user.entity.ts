import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export default class Users {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true, nullable: false })
  phone: string;
  @Column({ nullable: false })
  role: string;
  @Column({ length: 25, nullable: true })
  first_name: string;
  @Column({ length: 25, nullable: true })
  last_name: string;
  @Column({ select: false, nullable: false })
  password: string;
  @Column({ length: 10, nullable: true })
  national_code: string;
  @Column({ length: 10, nullable: true })
  birth_date: string;
  @Column({ length: 10, nullable: true })
  gender: string;
  @Column({ length: 25, nullable: true })
  education: string;
  @Column({ nullable: true })
  address: string;

  @Column('jsonb', { default: {} })
  self_declaration_data: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  interview_status: string | null;

  @Column({ type: 'text', nullable: true })
  interview_notes: string | null;
}
