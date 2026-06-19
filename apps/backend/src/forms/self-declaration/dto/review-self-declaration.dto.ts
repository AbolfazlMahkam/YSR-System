import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewSelfDeclarationDto {
  @IsEnum(['approved', 'returned'])
  status: 'approved' | 'returned';

  @IsOptional()
  @IsString()
  admin_notes?: string;
}
