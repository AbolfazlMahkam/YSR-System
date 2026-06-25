import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+98\d{10,14}$/, {
    message: 'Phone must start with +98 (e.g., +989123456789)',
  })
  phone: string;

  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  // @MinLength(8)  // password validation disabled — any password accepted
  @IsNotEmpty()
  password: string;
}
