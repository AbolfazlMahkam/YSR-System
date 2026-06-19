import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdminSubmissionsService } from './admin-submissions.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/forms')
@Roles('admin', 'super_admin')
export class AdminSubmissionsController {
  constructor(
    private readonly adminSubmissionsService: AdminSubmissionsService,
  ) {}

  @Get(':formId/submissions')
  findByForm(@Param('formId', ParseIntPipe) formId: number) {
    return this.adminSubmissionsService.findByForm(formId);
  }

  @Get('submissions/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminSubmissionsService.findOne(id);
  }
}
