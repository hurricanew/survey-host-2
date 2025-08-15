import { Test, TestingModule } from '@nestjs/testing';
import { SurveysService } from '../surveys.service';
import { PrismaService } from '../../database/prisma.service';
import { SurveyTextParser } from '../utils/text-parser';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SurveysService', () => {
  let service: SurveysService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    survey: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SurveyTextParser,
          useValue: {
            parse: jest.fn(),
            validateParsedSurvey: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a survey with unique slug', async () => {
      const userId = 'user-1';
      const createSurveyDto = {
        title: 'Test Survey',
        content: 'Test content',
        description: 'Test description',
      };

      const expectedSurvey = {
        id: 'survey-1',
        userId,
        title: 'Test Survey',
        content: 'Test content',
        description: 'Test description',
        slug: 'test-survey',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.survey.findUnique.mockResolvedValue(null);
      mockPrismaService.survey.create.mockResolvedValue(expectedSurvey);

      const result = await service.create(userId, createSurveyDto);

      expect(result).toEqual(expectedSurvey);
      expect(mockPrismaService.survey.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: 'Test Survey',
          description: 'Test description',
          content: '"Test content"',
          slug: 'test-survey',
        },
      });
    });

    it('should generate unique slug when base slug exists', async () => {
      const userId = 'user-1';
      const createSurveyDto = {
        title: 'Test Survey',
        content: 'Test content',
      };

      // Mock existing survey with same slug
      mockPrismaService.survey.findUnique
        .mockResolvedValueOnce({ id: 'existing-survey' }) // First call for base slug
        .mockResolvedValueOnce(null); // Second call for incremented slug

      const expectedSurvey = {
        id: 'survey-1',
        userId,
        slug: 'test-survey-1',
      };

      mockPrismaService.survey.create.mockResolvedValue(expectedSurvey);

      const result = await service.create(userId, createSurveyDto);

      expect(result.slug).toBe('test-survey-1');
    });
  });

  describe('findAllByUser', () => {
    it('should return surveys for a user', async () => {
      const userId = 'user-1';
      const expectedSurveys = [
        { id: 'survey-1', title: 'Survey 1', userId },
        { id: 'survey-2', title: 'Survey 2', userId },
      ];

      mockPrismaService.survey.findMany.mockResolvedValue(expectedSurveys);

      const result = await service.findAllByUser(userId);

      expect(result).toEqual(expectedSurveys);
      expect(mockPrismaService.survey.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOneBySlug', () => {
    it('should return survey by slug', async () => {
      const slug = 'test-survey';
      const expectedSurvey = {
        id: 'survey-1',
        slug,
        isActive: true,
        user: { name: 'Test User', email: 'test@example.com' },
      };

      mockPrismaService.survey.findUnique.mockResolvedValue(expectedSurvey);

      const result = await service.findOneBySlug(slug);

      expect(result).toEqual(expectedSurvey);
      expect(mockPrismaService.survey.findUnique).toHaveBeenCalledWith({
        where: { slug },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when survey not found', async () => {
      const slug = 'non-existent-survey';

      mockPrismaService.survey.findUnique.mockResolvedValue(null);

      await expect(service.findOneBySlug(slug)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when survey is inactive', async () => {
      const slug = 'inactive-survey';
      const inactiveSurvey = {
        id: 'survey-1',
        slug,
        isActive: false,
      };

      mockPrismaService.survey.findUnique.mockResolvedValue(inactiveSurvey);

      await expect(service.findOneBySlug(slug)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return survey by id and userId', async () => {
      const id = 'survey-1';
      const userId = 'user-1';
      const expectedSurvey = { id, userId, title: 'Test Survey' };

      mockPrismaService.survey.findFirst.mockResolvedValue(expectedSurvey);

      const result = await service.findOne(id, userId);

      expect(result).toEqual(expectedSurvey);
      expect(mockPrismaService.survey.findFirst).toHaveBeenCalledWith({
        where: { id, userId },
      });
    });

    it('should throw NotFoundException when survey not found', async () => {
      const id = 'non-existent-survey';
      const userId = 'user-1';

      mockPrismaService.survey.findFirst.mockResolvedValue(null);

      await expect(service.findOne(id, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update survey', async () => {
      const id = 'survey-1';
      const userId = 'user-1';
      const updateData = { title: 'Updated Survey' };
      const existingSurvey = { id, userId, title: 'Original Survey' };
      const updatedSurvey = { ...existingSurvey, ...updateData };

      mockPrismaService.survey.findFirst.mockResolvedValue(existingSurvey);
      mockPrismaService.survey.update.mockResolvedValue(updatedSurvey);

      const result = await service.update(id, userId, updateData);

      expect(result).toEqual(updatedSurvey);
      expect(mockPrismaService.survey.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
    });
  });

  describe('delete', () => {
    it('should delete survey', async () => {
      const id = 'survey-1';
      const userId = 'user-1';
      const existingSurvey = { id, userId, title: 'Survey to Delete' };

      mockPrismaService.survey.findFirst.mockResolvedValue(existingSurvey);
      mockPrismaService.survey.delete.mockResolvedValue(existingSurvey);

      const result = await service.delete(id, userId);

      expect(result).toEqual(existingSurvey);
      expect(mockPrismaService.survey.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('toggleActive', () => {
    it('should toggle survey active status', async () => {
      const id = 'survey-1';
      const userId = 'user-1';
      const existingSurvey = { id, userId, isActive: true };
      const toggledSurvey = { ...existingSurvey, isActive: false };

      mockPrismaService.survey.findFirst.mockResolvedValue(existingSurvey);
      mockPrismaService.survey.update.mockResolvedValue(toggledSurvey);

      const result = await service.toggleActive(id, userId);

      expect(result).toEqual(toggledSurvey);
      expect(mockPrismaService.survey.update).toHaveBeenCalledWith({
        where: { id },
        data: { isActive: false },
      });
    });
  });
});