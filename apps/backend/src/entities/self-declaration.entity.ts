import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
