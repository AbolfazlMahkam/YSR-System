import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Users from './user.entity';

export type SelfDeclarationStatus = 'pending' | 'approved' | 'returned';

@Entity('self_declarations')
export default class SelfDeclaration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @Column('jsonb', { default: {} })
  data: Record<string, any>;

  @Column('varchar', { default: 'pending' })
  status: SelfDeclarationStatus;

  @Column('varchar', { nullable: true })
  admin_notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
