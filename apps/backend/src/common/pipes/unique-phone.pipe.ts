import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Users from '../../entities/user.entity';

@Injectable()
export class UniquePhonePipe implements PipeTransform {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async transform(value: Record<string, unknown>, _metadata: ArgumentMetadata) {
    void _metadata;
    if (value?.phone) {
      const existingPhone = await this.usersRepository.findOne({
        where: { phone: value.phone as string },
      });

      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    return value;
  }
}
