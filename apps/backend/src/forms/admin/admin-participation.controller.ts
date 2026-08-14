import { Controller, Get } from '@nestjs/common';
import { AdminParticipationService } from './admin-participation.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/participation')
@Roles('admin', 'super_admin')
export class AdminParticipationController {
  constructor(
    private readonly adminParticipationService: AdminParticipationService,
  ) {}

  @Get()
  getReport() {
    return this.adminParticipationService.getReport();
  }
}
