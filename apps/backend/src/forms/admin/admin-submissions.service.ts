import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FormSchema from '../../entities/form-schema.entity';
import FormSubmission from '../../entities/form-submission.entity';

@Injectable()
export class AdminSubmissionsService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
  ) {}

  async findByForm(formId: number) {
    const form = await this.formSchemaRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const submissions = await this.submissionRepository.find({
      where: { form_id: formId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return {
      form,
      submissions,
      total: submissions.length,
    };
  }

  async findOne(submissionId: number) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['user', 'form'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }
}
