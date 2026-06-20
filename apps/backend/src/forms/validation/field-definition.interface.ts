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
    | 'range';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
  };
  fileConfig?: FileConfig;
  defaultValue?: any;
  multiple?: boolean;
}
