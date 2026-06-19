import { IsObject, IsNotEmpty } from 'class-validator';

export class CreateSubmissionDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, any>;
}
