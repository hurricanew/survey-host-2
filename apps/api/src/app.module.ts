import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { SurveysModule } from './surveys/surveys.module';

@Module({
  imports: [DatabaseModule, AuthModule, SurveysModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}