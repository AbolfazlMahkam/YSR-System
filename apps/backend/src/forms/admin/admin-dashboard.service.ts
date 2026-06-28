import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Users from '../../entities/user.entity';
import SelfDeclaration from '../../entities/self-declaration.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(SelfDeclaration)
    private readonly selfDeclarationRepository: Repository<SelfDeclaration>,
  ) {}

  async getStats() {
    const [totalUsers, selfDeclarations, usersWithInterview] =
      await Promise.all([
        this.usersRepository.count(),
        this.selfDeclarationRepository.find({ select: ['user_id', 'status'] }),
        this.usersRepository.find({
          select: ['id', 'interview_status'],
          where: [
            { interview_status: 'awaiting_interview' },
            { interview_status: 'accepted' },
            { interview_status: 'not_meeting_requirements' },
          ],
        }),
      ]);

    const userHasSelfDecl = new Set(
      selfDeclarations.map((sd) => sd.user_id),
    );

    const usersWithSelfDecl = userHasSelfDecl.size;
    const interviewCounts: Record<string, number> = {
      awaiting_interview: 0,
      accepted: 0,
      not_meeting_requirements: 0,
    };

    for (const user of usersWithInterview) {
      if (user.interview_status) {
        interviewCounts[user.interview_status] =
          (interviewCounts[user.interview_status] || 0) + 1;
      }
    }

    const selfDeclTotal = selfDeclarations.length;
    const selfDeclByStatus: Record<string, number> = {
      pending: 0,
      approved: 0,
      returned: 0,
    };

    for (const sd of selfDeclarations) {
      selfDeclByStatus[sd.status] = (selfDeclByStatus[sd.status] || 0) + 1;
    }

    return {
      users: {
        total: totalUsers,
        byStatus: {
          not_started: totalUsers - usersWithSelfDecl,
          form_completed: usersWithSelfDecl,
          awaiting_interview: interviewCounts.awaiting_interview || 0,
          accepted: interviewCounts.accepted || 0,
          not_meeting_requirements:
            interviewCounts.not_meeting_requirements || 0,
        },
      },
      selfDeclarations: {
        total: selfDeclTotal,
        byStatus: selfDeclByStatus,
      },
    };
  }
}
