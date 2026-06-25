import { IsNotEmpty, IsObject, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+98\d{10,14}$/, {
    message: 'Phone must start with +98 (e.g., +989123456789)',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
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

  @IsObject()
  @IsOptional()
  self_declaration_data?: Record<string, any>;
}
