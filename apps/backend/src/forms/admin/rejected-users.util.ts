import { Repository } from 'typeorm';
import Users from '../../entities/user.entity';

export const REJECTED_INTERVIEW_STATUS = 'not_meeting_requirements';

export async function getRejectedUserIds(
  usersRepository: Repository<Users>,
): Promise<Set<number>> {
  const rejected = await usersRepository.find({
    select: ['id'],
    where: { interview_status: REJECTED_INTERVIEW_STATUS },
  });
  return new Set(rejected.map((r) => r.id));
}
