import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FormSchema from '../../entities/form-schema.entity';
import FormSubmission from '../../entities/form-submission.entity';
import Users from '../../entities/user.entity';

export interface FormParticipation {
  id: number;
  slug: string;
  title: string;
  total_submissions: number;
  unique_users: number;
  user_ids: number[];
}

export interface UserParticipation {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  forms_submitted: number;
  submissions_count: number;
  by_form: Record<number, number>;
}

@Injectable()
export class AdminParticipationService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getReport() {
    const [forms, users, pairs] = await Promise.all([
      this.formSchemaRepository.find({ order: { created_at: 'DESC' } }),
      this.usersRepository.find({
        select: ['id', 'first_name', 'last_name', 'phone', 'role'],
        order: { id: 'ASC' },
      }),
      this.submissionRepository
        .createQueryBuilder('s')
        .select('s.user_id', 'user_id')
        .addSelect('s.form_id', 'form_id')
        .getRawMany(),
    ]);

    const perForm = new Map<number, { count: number; userIds: Set<number> }>();
    const perUser = new Map<
      number,
      { count: number; formIds: Set<number>; byForm: Map<number, number> }
    >();

    for (const row of pairs as { user_id: unknown; form_id: unknown }[]) {
      const formId = Number(row.form_id);
      const userId = Number(row.user_id);

      let f = perForm.get(formId);
      if (!f) {
        f = { count: 0, userIds: new Set() };
        perForm.set(formId, f);
      }
      f.count += 1;
      f.userIds.add(userId);

      let u = perUser.get(userId);
      if (!u) {
        u = { count: 0, formIds: new Set(), byForm: new Map() };
        perUser.set(userId, u);
      }
      u.count += 1;
      u.formIds.add(formId);
      u.byForm.set(formId, (u.byForm.get(formId) || 0) + 1);
    }

    const formParticipation: FormParticipation[] = forms
      .filter((f) => f.slug !== 'self-declaration')
      .map((form) => {
        const stat = perForm.get(form.id);
        return {
          id: form.id,
          slug: form.slug,
          title: form.title,
          total_submissions: stat?.count || 0,
          unique_users: stat?.userIds.size || 0,
          user_ids: stat ? Array.from(stat.userIds).sort((a, b) => a - b) : [],
        };
      });

    const userParticipation: UserParticipation[] = users.map((user) => {
      const stat = perUser.get(user.id);
      const byForm: Record<number, number> = {};
      if (stat) {
        for (const [formId, count] of stat.byForm) {
          byForm[formId] = count;
        }
      }
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        forms_submitted: stat?.formIds.size || 0,
        submissions_count: stat?.count || 0,
        by_form: byForm,
      };
    });

    const totalSubmissions = pairs.length;
    const usersWithSubmissions = userParticipation.filter(
      (u) => u.submissions_count > 0,
    ).length;

    const maxForms = Math.max(
      0,
      ...userParticipation.map((u) => u.forms_submitted),
    );
    const byFormCount: { forms: number; users: number }[] = [];
    for (let n = 0; n <= maxForms; n++) {
      byFormCount.push({
        forms: n,
        users: userParticipation.filter((u) => u.forms_submitted === n).length,
      });
    }

    return {
      forms: formParticipation,
      users: userParticipation,
      totals: {
        total_forms: formParticipation.length,
        total_users: userParticipation.length,
        users_with_submissions: usersWithSubmissions,
        total_submissions: totalSubmissions,
      },
      byFormCount,
    };
  }
}
