import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';

export class AssignConsultantsBatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  user_ids: number[];
}
