import { IsString, IsNotEmpty } from 'class-validator';

export class CreateYearDto {
  @IsString()
  @IsNotEmpty()
  year: string;
}
