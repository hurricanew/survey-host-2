import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return hello message', () => {
      expect(appController.getHello()).toContain('TTI Survey API is running');
    });
  });

  describe('getHealth', () => {
    it('should return health check', () => {
      const health = appController.getHealth();
      expect(health.status).toBe('OK');
      expect(health.service).toBe('TTI Survey API');
      expect(health.timestamp).toBeDefined();
      expect(health.environment).toBeDefined();
      expect(typeof health.timestamp).toBe('string');
    });
  });
});