import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import FormSchema from '../../entities/form-schema.entity';
import FormSubmission from '../../entities/form-submission.entity';
import { DynamicFormValidatorService } from '../validation/dynamic-form-validator.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

const SELF_DECLARATION_SLUG = 'self-declaration';

@Injectable()
export class DynamicFormService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
    private readonly validator: DynamicFormValidatorService,
  ) {}

  async getActiveSchemas() {
    return this.formSchemaRepository.find({
      where: {
        is_active: true,
        slug: Not(SELF_DECLARATION_SLUG),
      },
      select: [
        'id',
        'slug',
        'title',
        'description',
        'show_notification',
        'notification_title',
        'notification_text',
      ],
      order: { created_at: 'ASC' },
    });
  }

  async getSchemaBySlug(slug: string) {
    const schema = await this.formSchemaRepository.findOne({
      where: { slug, is_active: true },
    });

    if (!schema) {
      throw new NotFoundException(`Form schema with slug "${slug}" not found`);
    }

    return schema;
  }

  async submit(slug: string, userId: number, dto: CreateSubmissionDto) {
    const schema = await this.formSchemaRepository.findOne({
      where: { slug, is_active: true },
    });

    if (!schema) {
      throw new NotFoundException(`Form with slug "${slug}" not found`);
    }

    const validatedAnswers = this.validator.validate(
      schema.fields,
      dto.answers,
    );

    const submission = this.submissionRepository.create({
      user_id: userId,
      form_id: schema.id,
      answers: validatedAnswers,
    });

    return this.submissionRepository.save(submission);
  }

  async getMySubmissions(slug: string, userId: number) {
    const schema = await this.formSchemaRepository.findOne({
      where: { slug, is_active: true },
    });

    if (!schema) {
      throw new NotFoundException(`Form with slug "${slug}" not found`);
    }

    return this.submissionRepository.find({
      where: { user_id: userId, form_id: schema.id },
      order: { created_at: 'DESC' },
    });
  }

  async getMyAllSubmissions(userId: number) {
    return this.submissionRepository.find({
      where: { user_id: userId },
      relations: ['form'],
      order: { created_at: 'DESC' },
    });
  }
}
