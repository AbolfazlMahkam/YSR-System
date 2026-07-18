import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdminStatisticsService, FieldStat } from './admin-statistics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import FormSchema from '../../entities/form-schema.entity';

interface StatisticsResponse {
  form: FormSchema;
  fields: FieldStat[];
  totalSubmissions: number;
}

@Controller('admin/forms')
@Roles('admin', 'super_admin')
export class AdminStatisticsController {
  constructor(
    private readonly adminStatisticsService: AdminStatisticsService,
  ) {}

  @Get(':formId/statistics')
  getStatistics(
    @Param('formId', ParseIntPipe) formId: number,
  ): Promise<StatisticsResponse> {
    return this.adminStatisticsService.getStatistics(formId);
  }
}
