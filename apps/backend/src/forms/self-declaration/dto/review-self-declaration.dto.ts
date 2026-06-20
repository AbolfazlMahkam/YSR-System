import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewSelfDeclarationDto {
  @IsEnum(['approved', 'returned'])
  status: 'approved' | 'returned';

  @IsOptional()
  @IsString()
  admin_notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correction_fields?: string[];
}
