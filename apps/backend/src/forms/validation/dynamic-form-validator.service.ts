import { BadRequestException, Injectable } from '@nestjs/common';
import { FieldDefinition } from './field-definition.interface';

@Injectable()
export class DynamicFormValidatorService {
  validate(
    fields: FieldDefinition[],

    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    const errors: string[] = [];

    const fieldMap = new Map<string, FieldDefinition>();
    for (const field of fields) {
      fieldMap.set(field.name, field);
    }

    for (const field of fields) {
      if (!this.isFieldVisible(field, data, fieldMap)) {
        continue;
      }

      const value = data[field.name];

      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push(`"${field.label}" is required`);
        continue;
      }

      if (value === undefined || value === null || value === '') {
        if (field.defaultValue !== undefined) {
          cleaned[field.name] = field.defaultValue;
        }
        continue;
      }

      const typeError = this.validateType(field, value);
      if (typeError) {
        errors.push(typeError);
        continue;
      }

      const validationError = this.applyValidations(field, value);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      cleaned[field.name] = this.castValue(field, value);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return cleaned;
  }

  private validateType(field: FieldDefinition, value: unknown): string | null {
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          return `"${field.label}" must be a string`;
        }
        break;
      case 'number':
      case 'range':
        if (typeof value !== 'number' || isNaN(value)) {
          return `"${field.label}" must be a number`;
        }
        break;
      case 'date':
        if (typeof value !== 'string') {
          return `"${field.label}" must be a string`;
        }
        if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
          return `"${field.label}" must be a valid date (YYYY/MM/DD)`;
        }
        break;
      case 'select':
        if (field.multiple) {
          if (!Array.isArray(value)) {
            return `"${field.label}" must be an array`;
          }
          if (field.options) {
            const validValues = new Set(field.options.map((o) => o.value));
            for (const v of value as string[]) {
              if (!validValues.has(v)) {
                const valid = field.options.map((o) => o.value).join(', ');
                return `"${field.label}" contains invalid value "${v}". Valid options: ${valid}`;
              }
            }
          }
        } else {
          if (typeof value !== 'string') {
            return `"${field.label}" must be a string`;
          }
          if (field.options && !field.options.some((o) => o.value === value)) {
            const valid = field.options.map((o) => o.value).join(', ');
            return `"${field.label}" must be one of: ${valid}`;
          }
        }
        break;
      case 'radio':
        if (typeof value !== 'string') {
          return `"${field.label}" must be a string`;
        }
        if (field.options && !field.options.some((o) => o.value === value)) {
          const valid = field.options.map((o) => o.value).join(', ');
          return `"${field.label}" must be one of: ${valid}`;
        }
        break;
      case 'checkbox':
        if (!Array.isArray(value)) {
          return `"${field.label}" must be an array`;
        }
        if (field.options) {
          const validValues = new Set(field.options.map((o) => o.value));
          for (const v of value as string[]) {
            if (!validValues.has(v)) {
              const valid = field.options.map((o) => o.value).join(', ');
              return `"${field.label}" contains invalid value "${v}". Valid options: ${valid}`;
            }
          }
        }
        break;
      case 'file':
        if (typeof value !== 'string' || !value.trim()) {
          return `"${field.label}" must be a valid file URL`;
        }
        break;
      case 'province_city':
      case 'continent_country':
        break;
    }
    return null;
  }

  private applyValidations(
    field: FieldDefinition,
    value: unknown,
  ): string | null {
    const validations = field.validations;
    if (!validations) return null;

    if (field.type === 'text' || field.type === 'textarea') {
      const strValue = String(value);
      if (
        validations.minLength !== undefined &&
        strValue.length < validations.minLength
      ) {
        return `"${field.label}" must be at least ${validations.minLength} characters`;
      }
      if (
        validations.maxLength !== undefined &&
        strValue.length > validations.maxLength
      ) {
        return `"${field.label}" must be at most ${validations.maxLength} characters`;
      }
      if (validations.pattern) {
        const regex = new RegExp(validations.pattern);
        if (!regex.test(strValue)) {
          return `"${field.label}" does not match the required pattern`;
        }
      }
    }

    if (
      (field.type === 'number' || field.type === 'range') &&
      typeof value === 'number'
    ) {
      if (validations.min !== undefined && value < validations.min) {
        return `"${field.label}" must be at least ${validations.min}`;
      }
      if (validations.max !== undefined && value > validations.max) {
        return `"${field.label}" must be at most ${validations.max}`;
      }
    }

    return null;
  }

  private castValue(field: FieldDefinition, value: unknown): unknown {
    if (
      (field.type === 'number' || field.type === 'range') &&
      typeof value === 'string'
    ) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  }

  private isFieldVisible(
    field: FieldDefinition,
    data: Record<string, unknown>,
    fieldMap: Map<string, FieldDefinition>,
  ): boolean {
    if (!field.condition) return true;
    const depField = fieldMap.get(field.condition.field);
    if (!depField) return true;
    const depValue = data[field.condition.field];
    switch (field.condition.operator) {
      case 'equals':
        return depValue === field.condition.value;
      case 'not_equals':
        return depValue !== field.condition.value;
      case 'not_empty':
        return depValue !== undefined && depValue !== null && depValue !== '';
      default:
        return true;
    }
  }
}
