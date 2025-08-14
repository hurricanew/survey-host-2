import { Module } from '@nestjs/common';
import { SurveysController, PublicSurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SurveysController, PublicSurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}