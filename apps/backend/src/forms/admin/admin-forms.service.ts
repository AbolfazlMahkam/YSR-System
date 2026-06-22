import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FormSchema, { FieldDefinition } from '../../entities/form-schema.entity';
import FormSubmission from '../../entities/form-submission.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class AdminFormsService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
  ) {}

  async create(dto: CreateFormDto) {
    const existing = await this.formSchemaRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(
        `Form with slug "${dto.slug}" already exists`,
      );
    }

    const form = new FormSchema();
    form.slug = dto.slug;
    form.title = dto.title;
    form.description = dto.description || null;
    form.is_active = dto.is_active ?? true;
    form.is_multi_submit = dto.is_multi_submit ?? true;
    form.show_notification = dto.show_notification ?? false;
    form.notification_title = dto.notification_title || null;
    form.notification_text = dto.notification_text || null;
    form.fields = (dto.fields || []) as FieldDefinition[];

    return this.formSchemaRepository.save(form);
  }

  async findAll() {
    const forms = await this.formSchemaRepository.find({
      order: { created_at: 'DESC' },
    });

    const counts = await this.submissionRepository
      .createQueryBuilder('s')
      .select('s.form_id', 'form_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.form_id')
      .getRawMany();

    const countMap = new Map<number, number>();
    for (const row of counts as { form_id: unknown; count: unknown }[]) {
      countMap.set(Number(row.form_id), Number(row.count));
    }

    return forms.map((form) => ({
      ...form,
      total_submissions: countMap.get(form.id) || 0,
    }));
  }

  async findOne(id: number) {
    const form = await this.formSchemaRepository.findOne({ where: { id } });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const count = await this.submissionRepository.count({
      where: { form_id: id },
    });

    return { ...form, total_submissions: count };
  }

  async update(id: number, dto: UpdateFormDto) {
    const form = await this.formSchemaRepository.findOne({ where: { id } });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (dto.slug && dto.slug !== form.slug) {
      const existing = await this.formSchemaRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(
          `Form with slug "${dto.slug}" already exists`,
        );
      }
    }

    Object.assign(form, dto);
    return this.formSchemaRepository.save(form);
  }

  async remove(id: number) {
    const form = await this.formSchemaRepository.findOne({ where: { id } });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    await this.submissionRepository.delete({ form_id: id });
    return this.formSchemaRepository.remove(form);
  }
}
