import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessionDto } from './create-procession.dto';

export class UpdateProcessionDto extends PartialType(CreateProcessionDto) {}
