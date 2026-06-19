import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import FormSchema from './form-schema.entity';
import Users from './user.entity';

@Entity('form_submissions')
export default class FormSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  form_id: number;

  @Column('jsonb', { default: {} })
  answers: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => FormSchema)
  @JoinColumn({ name: 'form_id' })
  form: FormSchema;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
