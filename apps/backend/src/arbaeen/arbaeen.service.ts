import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ArbaeenYear from './entities/arbaeen-year.entity';
import ArbaeenProcession from './entities/arbaeen-procession.entity';
import ArbaeenProcessionConsultant from './entities/arbaeen-procession-consultant.entity';
import Users from '../entities/user.entity';
import { CreateYearDto } from './dto/create-year.dto';
import { CreateProcessionDto } from './dto/create-procession.dto';
import { UpdateProcessionDto } from './dto/update-procession.dto';
import { AssignConsultantDto } from './dto/assign-consultant.dto';
import { SetResponsibleConsultantDto } from './dto/set-responsible-consultant.dto';

@Injectable()
export class ArbaeenService {
  constructor(
    @InjectRepository(ArbaeenYear)
    private readonly yearRepo: Repository<ArbaeenYear>,
    @InjectRepository(ArbaeenProcession)
    private readonly processionRepo: Repository<ArbaeenProcession>,
    @InjectRepository(ArbaeenProcessionConsultant)
    private readonly consultantRepo: Repository<ArbaeenProcessionConsultant>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  // ---- Years ----

  async createYear(dto: CreateYearDto) {
    const existing = await this.yearRepo.findOne({
      where: { year: dto.year },
    });
    if (existing) {
      throw new ConflictException(`سال "${dto.year}" قبلاً ایجاد شده است`);
    }
    const year = this.yearRepo.create({ year: dto.year });
    return this.yearRepo.save(year);
  }

  async findAllYears() {
    return this.yearRepo.find({ order: { created_at: 'DESC' } });
  }

  async removeYear(id: number) {
    const year = await this.yearRepo.findOne({ where: { id } });
    if (!year) {
      throw new NotFoundException('سال یافت نشد');
    }
    return this.yearRepo.remove(year);
  }

  // ---- Processions ----

  async createProcession(dto: CreateProcessionDto) {
    const year = await this.yearRepo.findOne({
      where: { id: dto.year_id },
    });
    if (!year) {
      throw new NotFoundException('سال یافت نشد');
    }

    if (dto.responsible_consultant_id) {
      const consultant = await this.userRepo.findOne({
        where: { id: dto.responsible_consultant_id },
      });
      if (!consultant) {
        throw new NotFoundException('مشاور مسئول یافت نشد');
      }
    }

    const procession = this.processionRepo.create({
      year_id: dto.year_id,
      name: dto.name,
      location: dto.location as ArbaeenProcession['location'],
      address: dto.address,
      responsible_name: dto.responsible_name,
      responsible_phone: dto.responsible_phone,
      gender_requirement:
        dto.gender_requirement as ArbaeenProcession['gender_requirement'],
      responsible_consultant_id: dto.responsible_consultant_id ?? null,
    });
    return this.processionRepo.save(procession);
  }

  async findProcessionsByYear(yearId: number) {
    const year = await this.yearRepo.findOne({ where: { id: yearId } });
    if (!year) {
      throw new NotFoundException('سال یافت نشد');
    }
    return this.processionRepo.find({
      where: { year_id: yearId },
      order: { created_at: 'DESC' },
    });
  }

  async findOneProcession(id: number) {
    const procession = await this.processionRepo.findOne({
      where: { id },
      relations: ['responsible_consultant'],
    });
    if (!procession) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const consultants = await this.consultantRepo.find({
      where: { procession_id: id },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });

    return {
      ...procession,
      responsible_consultant: procession.responsible_consultant
        ? {
            id: procession.responsible_consultant.id,
            first_name: procession.responsible_consultant.first_name,
            last_name: procession.responsible_consultant.last_name,
            phone: procession.responsible_consultant.phone,
            gender: procession.responsible_consultant.gender,
          }
        : null,
      consultants: consultants.map((c) => ({
        id: c.user.id,
        first_name: c.user.first_name,
        last_name: c.user.last_name,
        phone: c.user.phone,
        gender: c.user.gender,
      })),
    };
  }

  async updateProcession(id: number, dto: UpdateProcessionDto) {
    const procession = await this.processionRepo.findOne({ where: { id } });
    if (!procession) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (dto.year_id) {
      const year = await this.yearRepo.findOne({
        where: { id: dto.year_id },
      });
      if (!year) {
        throw new NotFoundException('سال یافت نشد');
      }
    }

    if (dto.responsible_consultant_id !== undefined) {
      if (dto.responsible_consultant_id !== null) {
        const consultant = await this.userRepo.findOne({
          where: { id: dto.responsible_consultant_id },
        });
        if (!consultant) {
          throw new NotFoundException('مشاور مسئول یافت نشد');
        }
      }
      procession.responsible_consultant_id = dto.responsible_consultant_id ?? null;
    }

    if (dto.location) {
      procession.location = dto.location as ArbaeenProcession['location'];
    }
    if (dto.gender_requirement) {
      procession.gender_requirement =
        dto.gender_requirement as ArbaeenProcession['gender_requirement'];
    }
    if (dto.name !== undefined) procession.name = dto.name;
    if (dto.address !== undefined) procession.address = dto.address;
    if (dto.responsible_name !== undefined)
      procession.responsible_name = dto.responsible_name;
    if (dto.responsible_phone !== undefined)
      procession.responsible_phone = dto.responsible_phone;
    if (dto.year_id !== undefined) procession.year_id = dto.year_id;

    return this.processionRepo.save(procession);
  }

  async removeProcession(id: number) {
    const procession = await this.processionRepo.findOne({ where: { id } });
    if (!procession) {
      throw new NotFoundException('موکب یافت نشد');
    }
    return this.processionRepo.remove(procession);
  }

  async setResponsibleConsultant(
    processionId: number,
    dto: SetResponsibleConsultantDto,
  ) {
    const procession = await this.processionRepo.findOne({
      where: { id: processionId },
    });
    if (!procession) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (dto.responsible_consultant_id !== null) {
      const assigned = await this.consultantRepo.findOne({
        where: {
          procession_id: processionId,
          user_id: dto.responsible_consultant_id,
        },
      });
      if (!assigned) {
        throw new BadRequestException(
          'مشاور انتخاب شده باید در لیست مشاوران این موکب باشد',
        );
      }
    }

    procession.responsible_consultant_id = dto.responsible_consultant_id ?? null;
    await this.processionRepo.save(procession);

    return {
      id: procession.id,
      responsible_consultant_id: procession.responsible_consultant_id,
    };
  }

  // ---- Consultants ----

  async assignConsultant(processionId: number, dto: AssignConsultantDto) {
    const procession = await this.processionRepo.findOne({
      where: { id: processionId },
    });
    if (!procession) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const user = await this.userRepo.findOne({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const existing = await this.consultantRepo.findOne({
      where: { procession_id: processionId, user_id: dto.user_id },
    });
    if (existing) {
      throw new ConflictException('این مشاور قبلاً به این موکب اضافه شده است');
    }

    if (procession.gender_requirement !== 'both' && user.gender) {
      if (procession.gender_requirement !== user.gender) {
        throw new BadRequestException(
          `این موکب فقط برای مشاوران ${procession.gender_requirement === 'male' ? 'آقا' : 'خانم'} است`,
        );
      }
    }

    const consultant = this.consultantRepo.create({
      procession_id: processionId,
      user_id: dto.user_id,
    });
    return this.consultantRepo.save(consultant);
  }

  async assignConsultantsBatch(processionId: number, userIds: number[]) {
    const procession = await this.processionRepo.findOne({
      where: { id: processionId },
    });
    if (!procession) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const added: number[] = [];
    const skipped: number[] = [];

    for (const userId of userIds) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        skipped.push(userId);
        continue;
      }

      const existing = await this.consultantRepo.findOne({
        where: { procession_id: processionId, user_id: userId },
      });
      if (existing) {
        skipped.push(userId);
        continue;
      }

      if (procession.gender_requirement !== 'both' && user.gender) {
        if (procession.gender_requirement !== user.gender) {
          skipped.push(userId);
          continue;
        }
      }

      const consultant = this.consultantRepo.create({
        procession_id: processionId,
        user_id: userId,
      });
      await this.consultantRepo.save(consultant);
      added.push(userId);
    }

    return { added, skipped };
  }

  async removeConsultant(processionId: number, userId: number) {
    const consultant = await this.consultantRepo.findOne({
      where: { procession_id: processionId, user_id: userId },
    });
    if (!consultant) {
      throw new NotFoundException('مشاور در این موکب یافت نشد');
    }

    const procession = await this.processionRepo.findOne({
      where: { id: processionId },
    });
    if (procession && procession.responsible_consultant_id === userId) {
      procession.responsible_consultant_id = null;
      await this.processionRepo.save(procession);
    }

    return this.consultantRepo.remove(consultant);
  }

  async listProcessionConsultants(processionId: number) {
    const procession = await this.processionRepo.findOne({
      where: { id: processionId },
    });
    if (!procession) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const consultants = await this.consultantRepo.find({
      where: { procession_id: processionId },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });

    return consultants.map((c) => ({
      id: c.user.id,
      first_name: c.user.first_name,
      last_name: c.user.last_name,
      phone: c.user.phone,
      gender: c.user.gender,
    }));
  }

  async findAvailableConsultants(gender?: string) {
    const where: any = {};
    if (gender && gender !== 'both') {
      where.gender = gender;
    }
    where.role = 'user';

    const users = await this.userRepo.find({
      where,
      order: { first_name: 'ASC', last_name: 'ASC' },
    });

    return users.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone,
      gender: u.gender,
    }));
  }
}
