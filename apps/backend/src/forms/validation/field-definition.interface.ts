export interface FileConfig {
  accept?: string;
  maxSize?: number;
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'not_empty';
  value: string;
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
    | 'continent_country'
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
  condition?: FieldCondition;
}
