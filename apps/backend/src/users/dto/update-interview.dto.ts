import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateInterviewDto {
  @IsEnum(['accepted', 'not_meeting_requirements'])
  status: 'accepted' | 'not_meeting_requirements';

  @IsOptional()
  @IsString()
  notes?: string;
}
