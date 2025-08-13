import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'TTI Survey API is running - Backend scaffolding complete!';
  }
}