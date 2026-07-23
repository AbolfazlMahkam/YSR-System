import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ArbaeenYear from './entities/arbaeen-year.entity';
import ArbaeenProcession from './entities/arbaeen-procession.entity';
import ArbaeenProcessionConsultant from './entities/arbaeen-procession-consultant.entity';
import Users from '../entities/user.entity';
import { ArbaeenController } from './arbaeen.controller';
import { ArbaeenService } from './arbaeen.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArbaeenYear,
      ArbaeenProcession,
      ArbaeenProcessionConsultant,
      Users,
    ]),
  ],
  controllers: [ArbaeenController],
  providers: [ArbaeenService],
})
export class ArbaeenModule {}
