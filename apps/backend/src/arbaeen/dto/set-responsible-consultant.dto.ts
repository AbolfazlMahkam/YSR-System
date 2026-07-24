import { IsNumber, IsOptional } from 'class-validator';

export class SetResponsibleConsultantDto {
  @IsOptional()
  @IsNumber()
  responsible_consultant_id: number | null;
}
