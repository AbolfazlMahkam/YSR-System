import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordValidationPipe implements PipeTransform {
  async transform(value: Record<string, unknown>, _metadata: ArgumentMetadata) {
    void _metadata;
    if (value?.password && value?._user) {
      const isPasswordMatch = await bcrypt.compare(
        value.password as string,
        (value._user as { password: string }).password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('Wrong Password');
      }
    }

    return value;
  }
}
