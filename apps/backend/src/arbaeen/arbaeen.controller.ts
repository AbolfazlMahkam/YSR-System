import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ArbaeenService } from './arbaeen.service';
import { CreateYearDto } from './dto/create-year.dto';
import { CreateProcessionDto } from './dto/create-procession.dto';
import { UpdateProcessionDto } from './dto/update-procession.dto';
import { AssignConsultantDto } from './dto/assign-consultant.dto';
import { AssignConsultantsBatchDto } from './dto/assign-consultants-batch.dto';
import { SetResponsibleConsultantDto } from './dto/set-responsible-consultant.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('arbaeen')
@Roles('admin', 'super_admin')
export class ArbaeenController {
  constructor(private readonly arbaeenService: ArbaeenService) {}

  // ---- Years ----

  @Post('years')
  createYear(@Body() dto: CreateYearDto) {
    return this.arbaeenService.createYear(dto);
  }

  @Get('years')
  findAllYears() {
    return this.arbaeenService.findAllYears();
  }

  @Delete('years/:id')
  removeYear(@Param('id', ParseIntPipe) id: number) {
    return this.arbaeenService.removeYear(id);
  }

  // ---- Year-scoped processions ----

  @Get('years/:yearId/processions')
  findProcessionsByYear(@Param('yearId', ParseIntPipe) yearId: number) {
    return this.arbaeenService.findProcessionsByYear(yearId);
  }

  // ---- Processions CRUD ----

  @Post('processions')
  createProcession(@Body() dto: CreateProcessionDto) {
    return this.arbaeenService.createProcession(dto);
  }

  @Get('processions/:id')
  findOneProcession(@Param('id', ParseIntPipe) id: number) {
    return this.arbaeenService.findOneProcession(id);
  }

  @Put('processions/:id')
  updateProcession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProcessionDto,
  ) {
    return this.arbaeenService.updateProcession(id, dto);
  }

  @Delete('processions/:id')
  removeProcession(@Param('id', ParseIntPipe) id: number) {
    return this.arbaeenService.removeProcession(id);
  }

  @Put('processions/:id/responsible-consultant')
  setResponsibleConsultant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetResponsibleConsultantDto,
  ) {
    return this.arbaeenService.setResponsibleConsultant(id, dto);
  }

  // ---- Consultants ----

  @Get('processions/:id/consultants')
  listConsultants(@Param('id', ParseIntPipe) id: number) {
    return this.arbaeenService.listProcessionConsultants(id);
  }

  @Post('processions/:id/consultants')
  assignConsultant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignConsultantDto,
  ) {
    return this.arbaeenService.assignConsultant(id, dto);
  }

  @Post('processions/:id/consultants/batch')
  assignConsultantsBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignConsultantsBatchDto,
  ) {
    return this.arbaeenService.assignConsultantsBatch(id, dto.user_ids);
  }

  @Delete('processions/:id/consultants/:userId')
  removeConsultant(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.arbaeenService.removeConsultant(id, userId);
  }

  @Get('available-consultants')
  findAvailableConsultants(@Query('gender') gender?: string) {
    return this.arbaeenService.findAvailableConsultants(gender);
  }
}
