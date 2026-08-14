import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FormSchema from '../../entities/form-schema.entity';
import FormSubmission from '../../entities/form-submission.entity';
import Users from '../../entities/user.entity';
import { getRejectedUserIds } from './rejected-users.util';

@Injectable()
export class AdminSubmissionsService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async findByForm(formId: number) {
    const form = await this.formSchemaRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const rejectedUserIds = await getRejectedUserIds(this.usersRepository);

    const submissions = (
      await this.submissionRepository.find({
        where: { form_id: formId },
        relations: ['user'],
        order: { created_at: 'DESC' },
      })
    ).filter((s) => !rejectedUserIds.has(s.user_id));

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
