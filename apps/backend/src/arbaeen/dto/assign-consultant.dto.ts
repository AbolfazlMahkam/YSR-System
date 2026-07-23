import { IsNumber, IsNotEmpty } from 'class-validator';

export class AssignConsultantDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
