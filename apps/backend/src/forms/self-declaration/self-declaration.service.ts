import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SelfDeclaration from '../../entities/self-declaration.entity';
import FormSchema from '../../entities/form-schema.entity';
import { DynamicFormValidatorService } from '../validation/dynamic-form-validator.service';
import { CreateSelfDeclarationDto } from './dto/create-self-declaration.dto';
import { ReviewSelfDeclarationDto } from './dto/review-self-declaration.dto';
import { UsersService } from '../../users/users.service';

const SELF_DECLARATION_SLUG = 'self-declaration';

@Injectable()
export class SelfDeclarationService {
  constructor(
    @InjectRepository(SelfDeclaration)
    private readonly selfDeclarationRepository: Repository<SelfDeclaration>,
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    private readonly validator: DynamicFormValidatorService,
    private readonly usersService: UsersService,
  ) {}

  async submit(userId: number, dto: CreateSelfDeclarationDto) {
    const existing = await this.selfDeclarationRepository.findOne({
      where: { user_id: userId },
    });

    if (existing && existing.status !== 'returned') {
      throw new ConflictException(
        'Self-declaration form has already been submitted',
      );
    }

    const schema = await this.formSchemaRepository.findOne({
      where: { slug: SELF_DECLARATION_SLUG, is_active: true },
    });

    if (!schema) {
      throw new NotFoundException(
        'Self-declaration form schema is not configured',
      );
    }

    const validatedData = this.validator.validate(schema.fields, dto.data);

    const user = await this.usersService.findOne(userId);
    if (user) {
      await this.usersService.update(user, { self_declaration_data: validatedData });
    }

    if (existing) {
      existing.data = validatedData;
      existing.status = 'pending';
      existing.admin_notes = null;
      existing.correction_fields = null;
      return this.selfDeclarationRepository.save(existing);
    }

    const submission = this.selfDeclarationRepository.create({
      user_id: userId,
      data: validatedData,
    });

    return this.selfDeclarationRepository.save(submission);
  }

  async getMySubmission(userId: number) {
    const submission = await this.selfDeclarationRepository.findOne({
      where: { user_id: userId },
    });

    if (!submission) {
      throw new NotFoundException('Self-declaration form not submitted yet');
    }

    return submission;
  }

  async findAll() {
    return this.selfDeclarationRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const submission = await this.selfDeclarationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!submission) {
      throw new NotFoundException('Self-declaration submission not found');
    }

    return submission;
  }

  async review(id: number, dto: ReviewSelfDeclarationDto) {
    const submission = await this.findOne(id);

    if (submission.status === 'approved' && dto.status === 'approved') {
      throw new BadRequestException('Submission is already approved');
    }

    if (dto.status === 'returned') {
      if (!dto.admin_notes) {
        throw new BadRequestException(
          'Admin notes are required when returning for correction',
        );
      }
      if (!dto.correction_fields || dto.correction_fields.length === 0) {
        throw new BadRequestException(
          'At least one field must be selected for correction',
        );
      }
    }

    submission.status = dto.status;
    submission.admin_notes = dto.admin_notes || null;
    submission.correction_fields =
      dto.status === 'returned' ? (dto.correction_fields ?? null) : null;

    return this.selfDeclarationRepository.save(submission);
  }
}
