import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { ParseSurveyDto, ParseSurveyResponseDto } from './dto/parse-survey.dto';
import { Survey } from '@prisma/client';
import { SurveyTextParser } from './utils/text-parser';

@Injectable()
export class SurveysService {
  constructor(
    private prisma: PrismaService,
    private surveyTextParser: SurveyTextParser
  ) {}

  async create(userId: string, createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const { title, content, description } = createSurveyDto;
    
    // Generate a unique 8-digit hash key
    const slug = await this.generateUniqueSlugWithRetry();
    
    return this.prisma.survey.create({
      data: {
        userId,
        title,
        description,
        content: JSON.stringify(content),
        slug,
      },
    });
  }

  async findAllByUser(userId: string): Promise<Survey[]> {
    return this.prisma.survey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBySlug(slug: string): Promise<Survey> {
    const survey = await this.prisma.survey.findUnique({
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

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    if (!survey.isActive) {
      throw new BadRequestException('Survey is not active');
    }

    return survey;
  }

  async findOne(id: string, userId: string): Promise<Survey> {
    const survey = await this.prisma.survey.findFirst({
      where: { id, userId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }

  async update(id: string, userId: string, updateData: Partial<CreateSurveyDto>): Promise<Survey> {
    // Check if survey exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.survey.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string): Promise<Survey> {
    // Check if survey exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.survey.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, userId: string): Promise<Survey> {
    const survey = await this.findOne(id, userId);
    
    return this.prisma.survey.update({
      where: { id },
      data: { isActive: !survey.isActive },
    });
  }

  async parseSurvey(parseSurveyDto: ParseSurveyDto): Promise<ParseSurveyResponseDto> {
    const { text } = parseSurveyDto;
    
    // Parse the survey text using DeepSeek API
    const parsedSurvey = await this.surveyTextParser.parse(text);
    
    // Generate a simple slug based on the title (without database check for now)
    const slug = this.generateSimpleSlug(parsedSurvey.title);
    
    return {
      ...parsedSurvey,
      slug
    };
  }

  private generateSimpleSlug(title: string): string {
    // Generate 8-digit unique hash key
    return this.generateUniqueHashKey();
  }

  private generateUniqueHashKey(): string {
    // Generate a random 8-digit hash using alphanumeric characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async generateUniqueSlugWithRetry(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const hashKey = this.generateUniqueHashKey();
      
      // Check if this hash key already exists
      const existingSurvey = await this.prisma.survey.findUnique({
        where: { slug: hashKey },
      });
      
      if (!existingSurvey) {
        return hashKey;
      }
      
      attempts++;
    }
    
    // If we've exhausted attempts, throw an error
    throw new Error('Unable to generate unique hash key after maximum attempts');
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    // Create base slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    if (!baseSlug) {
      baseSlug = 'survey';
    }

    // Check if base slug is unique
    const existingSurvey = await this.prisma.survey.findUnique({
      where: { slug: baseSlug },
    });

    if (!existingSurvey) {
      return baseSlug;
    }

    // If not unique, append a random string
    let counter = 1;
    let slug = `${baseSlug}-${counter}`;
    
    while (await this.prisma.survey.findUnique({ where: { slug } })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }
}