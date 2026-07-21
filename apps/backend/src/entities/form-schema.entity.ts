import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface FileConfig {
  accept?: string;
  maxSize?: number;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'file'
    | 'province_city'
    | 'continent_country';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  fileConfig?: FileConfig;
  defaultValue?: any;
  multiple?: boolean;
}

@Entity('form_schemas')
export default class FormSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column('varchar', { nullable: true })
  description: string | null;

  @Column('jsonb', { default: [] })
  fields: FieldDefinition[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: true })
  is_multi_submit: boolean;

  @Column({ default: false })
  show_notification: boolean;

  @Column('varchar', { nullable: true })
  notification_title: string | null;

  @Column('varchar', { nullable: true })
  notification_text: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
