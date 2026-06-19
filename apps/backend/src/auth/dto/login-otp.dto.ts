import { IsString, IsOptional, IsNumber, Matches } from 'class-validator';
import Users from '../../entities/user.entity';
import Codes from '../../entities/code.entity';

export class LoginByOtpDto {
  @IsString()
  @Matches(/^\+98\d{10,14}$/, {
    message: 'Phone must start with +98 (e.g., +989123456789)',
  })
  phone: string;
  @IsOptional()
  @IsNumber()
  code: number;

  // Populated by UserExistsByPhonePipe
  _user?: Users;
  // Populated by OtpCodeValidationPipe
  _validatedCode?: Codes;
}
