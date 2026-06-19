import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminFormsService } from './admin-forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/forms')
@Roles('admin', 'super_admin')
export class AdminFormsController {
  constructor(private readonly adminFormsService: AdminFormsService) {}

  @Post()
  create(@Body() dto: CreateFormDto) {
    return this.adminFormsService.create(dto);
  }

  @Get()
  findAll() {
    return this.adminFormsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminFormsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFormDto) {
    return this.adminFormsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminFormsService.remove(id);
  }
}
