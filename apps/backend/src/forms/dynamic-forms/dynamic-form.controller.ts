import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { DynamicFormService } from './dynamic-form.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('forms')
export class DynamicFormController {
  constructor(private readonly dynamicFormService: DynamicFormService) {}

  @Get('schemas')
  getActiveSchemas() {
    return this.dynamicFormService.getActiveSchemas();
  }

  @Get('schemas/:slug')
  getSchemaBySlug(@Param('slug') slug: string) {
    return this.dynamicFormService.getSchemaBySlug(slug);
  }

  @Post(':formSlug/submit')
  submit(
    @Param('formSlug') formSlug: string,
    @GetUser('id') userId: number,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.dynamicFormService.submit(formSlug, userId, dto);
  }

  @Get(':formSlug/submissions')
  getMySubmissions(
    @Param('formSlug') formSlug: string,
    @GetUser('id') userId: number,
  ) {
    return this.dynamicFormService.getMySubmissions(formSlug, userId);
  }
}
