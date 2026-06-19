import { IsObject, IsNotEmpty } from 'class-validator';

export class CreateSelfDeclarationDto {
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
