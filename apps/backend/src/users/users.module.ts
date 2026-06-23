import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Users from '../entities/user.entity';
import { UniquePhonePipe } from '../common/pipes/unique-phone.pipe';
import { UserExistsPipe } from '../common/pipes/user-exists.pipe';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService, UniquePhonePipe, UserExistsPipe],
  exports: [UsersService],
})
export class UsersModule {}
