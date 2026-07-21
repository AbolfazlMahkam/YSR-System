import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsIn,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class OptionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

class ValidationDto {
  @IsOptional()
  minLength?: number;

  @IsOptional()
  maxLength?: number;

  @IsOptional()
  min?: number;

  @IsOptional()
  max?: number;

  @IsOptional()
  step?: number;

  @IsOptional()
  @IsString()
  pattern?: string;
}

class FileConfigDto {
  @IsOptional()
  @IsString()
  accept?: string;

  @IsOptional()
  maxSize?: number;
}

class ConditionDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['equals', 'not_equals', 'not_empty'])
  operator: string;

  @IsString()
  value: string;
}

class FieldDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'text',
    'textarea',
    'number',
    'date',
    'select',
    'radio',
    'checkbox',
    'file',
    'province_city',
    'range',
  ])
  type: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ValidationDto)
  validations?: ValidationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FileConfigDto)
  fileConfig?: FileConfigDto;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  @IsBoolean()
  multiple?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionDto)
  condition?: ConditionDto;
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_multi_submit?: boolean;

  @IsOptional()
  @IsBoolean()
  show_notification?: boolean;

  @IsOptional()
  @IsString()
  notification_title?: string;

  @IsOptional()
  @IsString()
  notification_text?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDefinitionDto)
  fields?: FieldDefinitionDto[];
}
