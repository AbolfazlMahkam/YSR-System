import {
  PipeTransform,
  Injectable,
  NotFoundException,
  ArgumentMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Users from '../../entities/user.entity';

@Injectable()
export class UserExistsByPhonePipe implements PipeTransform {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async transform(value: Record<string, unknown>, _metadata: ArgumentMetadata) {
    void _metadata;
    if (value?.phone) {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.phone = :phone', { phone: value.phone as string })
        .addSelect('user.password')
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      value._user = user;
    }

    return value;
  }
}
