import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Codes from '../../entities/code.entity';

@Injectable()
export class OtpCodeValidationPipe implements PipeTransform {
  constructor(
    @InjectRepository(Codes)
    private readonly codeRepository: Repository<Codes>,
  ) {}

  async transform(value: Record<string, unknown>, _metadata: ArgumentMetadata) {
    void _metadata;
    if (value?.code && value?.phone) {
      const checkCode = await this.codeRepository.findOne({
        where: {
          code: value.code as number,
          phone: value.phone as string,
          is_used: false,
        },
      });

      if (!checkCode) {
        throw new BadRequestException('code is not valid');
      }

      value._validatedCode = checkCode;
    }

    return value;
  }
}
