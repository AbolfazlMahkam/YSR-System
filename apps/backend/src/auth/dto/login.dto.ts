import { IsNotEmpty, IsString, Matches } from 'class-validator';
import Users from '../../entities/user.entity';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+98\d{10,14}$/, {
    message: 'Phone must start with +98 (e.g., +989123456789)',
  })
  phone: string;
  @IsNotEmpty()
  password: string;

  // Populated by UserExistsByPhonePipe
  _user?: Users;
}
