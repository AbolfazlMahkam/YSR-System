import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { SelfDeclarationService } from './self-declaration.service';
import { CreateSelfDeclarationDto } from './dto/create-self-declaration.dto';
import { ReviewSelfDeclarationDto } from './dto/review-self-declaration.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('forms/self-declaration')
export class SelfDeclarationController {
  constructor(
    private readonly selfDeclarationService: SelfDeclarationService,
  ) {}

  @Post()
  submit(@GetUser('id') userId: number, @Body() dto: CreateSelfDeclarationDto) {
    return this.selfDeclarationService.submit(userId, dto);
  }

  @Get()
  getMySubmission(@GetUser('id') userId: number) {
    return this.selfDeclarationService.getMySubmission(userId);
  }

  @Get('admin')
  @Roles('super_admin')
  findAll() {
    return this.selfDeclarationService.findAll();
  }

  @Get('admin/:id')
  @Roles('super_admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.selfDeclarationService.findOne(id);
  }

  @Patch('admin/:id/review')
  @Roles('super_admin')
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewSelfDeclarationDto,
  ) {
    return this.selfDeclarationService.review(id, dto);
  }
}
