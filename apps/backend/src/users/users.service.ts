import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Users from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { REJECTED_INTERVIEW_STATUS } from '../forms/admin/rejected-users.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  findUserByPhone = async (phone: string) => {
    return await this.usersRepository.findOne({
      where: { phone: phone },
    });
  };

  findAll = async () => {
    return await this.usersRepository.find();
  };

  findUsersByRoles = async (roles: string[]) => {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles })
      .getMany();
  };

  createUser = async (data: CreateUserDto) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);

    return user;
  };

  async findOne(id: number) {
    // This method is for internal use only
    // External endpoints should use UserExistsPipe for validation
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    return user;
  }

  async update(user: Users, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    return user;
  }

  async updateInterview(user: Users, dto: UpdateInterviewDto) {
    user.interview_status = dto.status;
    user.interview_notes =
      dto.status === REJECTED_INTERVIEW_STATUS ? dto.notes || null : null;

    return this.usersRepository.save(user);
  }

  async remove(user: Users) {
    await this.usersRepository.remove(user);

    return {
      message: 'User successfully deleted',
      id: user.id,
    };
  }
}
