import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SurveysController, PublicSurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { SurveyTextParser } from './utils/text-parser';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule, HttpModule],
  controllers: [SurveysController, PublicSurveysController],
  providers: [SurveysService, SurveyTextParser],
  exports: [SurveysService],
})
export class SurveysModule {}