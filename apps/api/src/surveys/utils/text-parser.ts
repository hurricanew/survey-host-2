import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ParsedQuestion {
  id: number;
  text: string;
  options: Array<{
    id: string;
    text: string;
    score: number;
  }>;
}

export interface ScoreRange {
  min: number;
  max: number;
  title: string;
  description: string;
}

export interface ParsedSurvey {
  title: string;
  description: string;
  questions: ParsedQuestion[];
  scoringGuide: {
    pointValues: string;
    totalPossible: number;
    ranges: ScoreRange[];
  };
  note?: string;
}

@Injectable()
export class SurveyTextParser {
  constructor(private readonly httpService: HttpService) {}

  async parse(text: string): Promise<ParsedSurvey> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('Survey text cannot be empty');
    }

    if (text.length > 1048576) { // 1MB limit
      throw new BadRequestException('Survey text is too large. Maximum size is 1MB.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://api.deepseek.com/chat/completions', {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a survey text parser. Parse the survey text and return a JSON object with the following structure:
{
  "title": "string",
  "description": "string", 
  "questions": [
    {
      "id": number,
      "text": "string",
      "options": [
        {
          "id": "a"|"b"|"c"|"d",
          "text": "string",
          "score": 0|1|2|3
        }
      ]
    }
  ],
  "scoringGuide": {
    "pointValues": "string",
    "totalPossible": number,
    "ranges": [
      {
        "min": number,
        "max": number,
        "title": "string", 
        "description": "string"
      }
    ]
  },
  "note": "string (optional)"
}

Rules:
- Extract the title from the first line
- Extract description from the text after title before questions
- Parse numbered questions (1., 2., etc.)
- Parse lettered options (a), b), c), d) with scores a=0, b=1, c=2, d=3
- Extract scoring guide with point values and score ranges
- Extract any notes at the end
- Return only valid JSON, no explanations`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Failed to get response from DeepSeek API');
      }

      let parsedSurvey: ParsedSurvey;
      try {
        // Clean the content by removing markdown code block formatting if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        parsedSurvey = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', content);
        throw new BadRequestException('Failed to parse survey: AI returned invalid JSON format');
      }

      // Validate the parsed survey
      this.validateParsedSurvey(parsedSurvey);

      return parsedSurvey;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Log the actual error for debugging while providing user-friendly message
      console.error('DeepSeek API request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      throw new BadRequestException('Failed to parse survey text. Please check the format and try again.');
    }
  }

  validateParsedSurvey(survey: ParsedSurvey): void {
    if (!survey.title || survey.title.trim().length === 0) {
      throw new BadRequestException('Survey title is required');
    }

    if (!survey.description || survey.description.trim().length === 0) {
      throw new BadRequestException('Survey description is required');
    }

    if (!survey.questions || survey.questions.length === 0) {
      throw new BadRequestException('Survey must have at least one question');
    }

    survey.questions.forEach((question, index) => {
      if (!question.text || question.text.trim().length === 0) {
        throw new BadRequestException(`Question ${index + 1} text is required`);
      }

      if (!question.options || question.options.length !== 4) {
        throw new BadRequestException(`Question ${index + 1} must have exactly 4 options`);
      }

      const expectedIds = ['a', 'b', 'c', 'd'];
      question.options.forEach((option, optionIndex) => {
        if (option.id !== expectedIds[optionIndex]) {
          throw new BadRequestException(`Question ${index + 1} option ${optionIndex + 1} must have id '${expectedIds[optionIndex]}'`);
        }

        if (option.score !== optionIndex) {
          throw new BadRequestException(`Question ${index + 1} option ${option.id} must have score ${optionIndex}`);
        }

        if (!option.text || option.text.trim().length === 0) {
          throw new BadRequestException(`Question ${index + 1} option ${option.id} text is required`);
        }
      });
    });

    if (!survey.scoringGuide || !survey.scoringGuide.ranges || survey.scoringGuide.ranges.length === 0) {
      throw new BadRequestException('Survey must have scoring guide with ranges');
    }
  }
}