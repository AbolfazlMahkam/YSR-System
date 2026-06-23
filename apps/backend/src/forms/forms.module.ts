import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SelfDeclaration from '../entities/self-declaration.entity';
import FormSchema from '../entities/form-schema.entity';
import FormSubmission from '../entities/form-submission.entity';
import { SelfDeclarationController } from './self-declaration/self-declaration.controller';
import { SelfDeclarationService } from './self-declaration/self-declaration.service';
import { DynamicFormController } from './dynamic-forms/dynamic-form.controller';
import { DynamicFormService } from './dynamic-forms/dynamic-form.service';
import { DynamicFormValidatorService } from './validation/dynamic-form-validator.service';
import { AdminFormsController } from './admin/admin-forms.controller';
import { AdminFormsService } from './admin/admin-forms.service';
import { AdminSubmissionsController } from './admin/admin-submissions.controller';
import { AdminSubmissionsService } from './admin/admin-submissions.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SelfDeclaration, FormSchema, FormSubmission]),
    UsersModule,
  ],
  controllers: [
    SelfDeclarationController,
    DynamicFormController,
    AdminFormsController,
    AdminSubmissionsController,
  ],
  providers: [
    SelfDeclarationService,
    DynamicFormService,
    DynamicFormValidatorService,
    AdminFormsService,
    AdminSubmissionsService,
  ],
})
export class FormsModule {}
