import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FormSchema from '../../entities/form-schema.entity';
import FormSubmission from '../../entities/form-submission.entity';

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
}

export interface OptionCount {
  label: string;
  value: string;
  count: number;
}

export interface FieldStat {
  name: string;
  label: string;
  type: string;
  total: number;
  options: OptionCount[];
}

@Injectable()
export class AdminStatisticsService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
  ) {}

  async getStatistics(formId: number) {
    const form = await this.formSchemaRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const submissions = await this.submissionRepository.find({
      where: { form_id: formId },
    });

    if (submissions.length === 0) {
      return {
        form,
        fields: [],
        totalSubmissions: 0,
      };
    }

    const statFields = (form.fields as FieldDefinition[]).filter((f) =>
      ['select', 'radio', 'checkbox'].includes(f.type),
    );

    const fields: FieldStat[] = statFields.map((field) => {
      const optionMap = new Map<string, number>();

      (field.options || []).forEach((opt) => {
        optionMap.set(opt.value, 0);
      });

      submissions.forEach((sub) => {
        const answer = sub.answers[field.name];
        if (answer === undefined || answer === null || answer === '') return;
        if (answer === '' || (Array.isArray(answer) && answer.length === 0))
          return;

        if (Array.isArray(answer)) {
          answer.forEach((val: string) => {
            optionMap.set(val, (optionMap.get(val) || 0) + 1);
          });
        } else if (typeof answer === 'string') {
          optionMap.set(answer, (optionMap.get(answer) || 0) + 1);
        }
      });

      const options: OptionCount[] = (field.options || []).map((opt) => ({
        label: opt.label,
        value: opt.value,
        count: optionMap.get(opt.value) || 0,
      }));

      return {
        name: field.name,
        label: field.label,
        type: field.type,
        total: submissions.length,
        options,
      };
    });

    return {
      form,
      fields,
      totalSubmissions: submissions.length,
    };
  }
}
