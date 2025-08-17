import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { ParseSurveyDto } from './dto/parse-survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createSurveyDto: CreateSurveyDto) {
    return this.surveysService.create(user.id, createSurveyDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.surveysService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.surveysService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateSurveyDto: Partial<CreateSurveyDto>
  ) {
    return this.surveysService.update(id, user.id, updateSurveyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.surveysService.delete(id, user.id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.surveysService.toggleActive(id, user.id);
  }

}

// Public endpoint for viewing surveys (no auth required)
@Controller('public/surveys')
export class PublicSurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post('parse')
  parseSurvey(@Body() parseSurveyDto: ParseSurveyDto) {
    return this.surveysService.parseSurvey(parseSurveyDto);
  }

  @Post('create')
  createSurveyPublic(@Body() createSurveyDto: CreateSurveyDto) {
    // For development - use the test user ID
    const testUserId = 'test-user-123';
    return this.surveysService.create(testUserId, createSurveyDto);
  }

  @Get('all')
  getAllSurveysPublic() {
    // For development - get surveys for test user
    const testUserId = 'test-user-123';
    return this.surveysService.findAllByUser(testUserId);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.surveysService.findOneBySlug(slug);
  }

  @Delete(':id')
  deletePublic(@Param('id') id: string) {
    // For development - delete surveys for test user
    const testUserId = 'test-user-123';
    return this.surveysService.delete(id, testUserId);
  }

}