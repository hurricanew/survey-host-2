import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { SurveyTextParser } from '../text-parser';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('SurveyTextParser', () => {
  let parser: SurveyTextParser;
  let httpService: HttpService;

  const mockValidResponse: AxiosResponse<any> = {
    data: {
      choices: [{
        message: {
          content: JSON.stringify({
            title: 'Personal Wellness Assessment Survey',
            description: 'This survey helps you evaluate your overall wellness across different life areas.',
            questions: [
              {
                id: 1,
                text: 'How often do you engage in physical exercise or activities?',
                options: [
                  { id: 'a', text: 'Never or rarely - I don\'t exercise regularly', score: 0 },
                  { id: 'b', text: '1-2 times per week - Light physical activity', score: 1 },
                  { id: 'c', text: '3-4 times per week - Moderate exercise routine', score: 2 },
                  { id: 'd', text: '5+ times per week - Regular active lifestyle', score: 3 }
                ]
              }
            ],
            scoringGuide: {
              pointValues: 'a=0, b=1, c=2, d=3',
              totalPossible: 3,
              ranges: [
                { min: 0, max: 1, title: 'Low', description: 'Low score' },
                { min: 2, max: 3, title: 'High', description: 'High score' }
              ]
            },
            note: 'This assessment is for self-reflection purposes.'
          })
        }
      }]
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyTextParser,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn()
          }
        }
      ],
    }).compile();

    parser = module.get<SurveyTextParser>(SurveyTextParser);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('parse', () => {
    it('should parse valid survey text correctly using DeepSeek API', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockValidResponse));

      const result = await parser.parse('Valid survey text...');

      expect(result.title).toBe('Personal Wellness Assessment Survey');
      expect(result.description).toContain('This survey helps you evaluate');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].id).toBe(1);
      expect(result.questions[0].options).toHaveLength(4);
      expect(result.questions[0].options[0].id).toBe('a');
      expect(result.questions[0].options[0].score).toBe(0);
      expect(result.scoringGuide.ranges).toHaveLength(2);
      expect(result.note).toContain('self-reflection purposes');
    });

    it('should throw error for empty text', async () => {
      await expect(parser.parse('')).rejects.toThrow(BadRequestException);
      await expect(parser.parse('   ')).rejects.toThrow(BadRequestException);
    });

    it('should throw error for text too large', async () => {
      const largeText = 'a'.repeat(1048577); // > 1MB
      await expect(parser.parse(largeText)).rejects.toThrow(BadRequestException);
    });

    it('should throw error when DeepSeek API fails', async () => {
      const mockErrorResponse: AxiosResponse<any> = {
        data: { choices: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockErrorResponse));

      await expect(parser.parse('Some text')).rejects.toThrow(BadRequestException);
    });

    it('should throw error when DeepSeek returns invalid JSON', async () => {
      const mockInvalidResponse: AxiosResponse<any> = {
        data: {
          choices: [{
            message: { content: 'Invalid JSON response' }
          }]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockInvalidResponse));

      await expect(parser.parse('Some text')).rejects.toThrow(BadRequestException);
    });

    it('should throw error when API request fails', async () => {
      jest.spyOn(httpService, 'post').mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(parser.parse('Some text')).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateParsedSurvey', () => {
    it('should validate correct survey structure', () => {
      const validSurvey = {
        title: 'Test Survey',
        description: 'Test Description',
        questions: [
          {
            id: 1,
            text: 'Question 1?',
            options: [
              { id: 'a', text: 'Option A', score: 0 },
              { id: 'b', text: 'Option B', score: 1 },
              { id: 'c', text: 'Option C', score: 2 },
              { id: 'd', text: 'Option D', score: 3 }
            ]
          }
        ],
        scoringGuide: {
          pointValues: 'a=0, b=1, c=2, d=3',
          totalPossible: 3,
          ranges: [
            { min: 0, max: 1, title: 'Low', description: 'Low score' },
            { min: 2, max: 3, title: 'High', description: 'High score' }
          ]
        }
      };

      expect(() => parser.validateParsedSurvey(validSurvey)).not.toThrow();
    });

    it('should throw error for missing title', () => {
      const invalidSurvey = {
        title: '',
        description: 'Test Description',
        questions: [],
        scoringGuide: { pointValues: '', totalPossible: 0, ranges: [] }
      };

      expect(() => parser.validateParsedSurvey(invalidSurvey)).toThrow(BadRequestException);
    });

    it('should throw error for no questions', () => {
      const invalidSurvey = {
        title: 'Test',
        description: 'Test Description',
        questions: [],
        scoringGuide: { pointValues: '', totalPossible: 0, ranges: [] }
      };

      expect(() => parser.validateParsedSurvey(invalidSurvey)).toThrow(BadRequestException);
    });

    it('should throw error for too few options', () => {
      const invalidSurvey = {
        title: 'Test',
        description: 'Test Description',
        questions: [
          {
            id: 1,
            text: 'Question?',
            options: [
              { id: 'a', text: 'Option A', score: 0 }
            ]
          }
        ],
        scoringGuide: { pointValues: '', totalPossible: 0, ranges: [] }
      };

      expect(() => parser.validateParsedSurvey(invalidSurvey)).toThrow(BadRequestException);
    });
  });
});