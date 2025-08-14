import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { Survey } from '@prisma/client';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const { title, content, description } = createSurveyDto;
    
    // Generate a unique slug
    const slug = await this.generateUniqueSlug(title);
    
    return this.prisma.survey.create({
      data: {
        userId,
        title,
        description,
        content,
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