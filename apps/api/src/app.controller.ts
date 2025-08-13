import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface HealthResponse {
  status: 'OK';
  service: string;
  timestamp: string;
  environment: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'OK',
      service: 'TTI Survey API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}