import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateProcessionDto {
  @IsNumber()
  year_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['Najaf Ashraf', "Karbala Mu'alla", 'Tariq Al-Hussein (AS)'])
  location: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  responsible_name: string;

  @IsString()
  @IsNotEmpty()
  responsible_phone: string;

  @IsString()
  @IsIn(['male', 'female', 'both'])
  gender_requirement: string;

  @IsOptional()
  @ValidateIf((v) => v.responsible_consultant_id !== null)
  @IsNumber()
  responsible_consultant_id?: number | null;
}
