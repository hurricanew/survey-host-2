import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ParseSurveyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1048576) // 1MB limit
  text: string;
}

export class ParseSurveyResponseDto {
  title: string;
  description: string;
  questions: Array<{
    id: number;
    text: string;
    options: Array<{
      id: string;
      text: string;
      score: number;
    }>;
  }>;
  scoringGuide: {
    pointValues: string;
    totalPossible: number;
    ranges: Array<{
      min: number;
      max: number;
      title: string;
      description: string;
    }>;
  };
  note?: string;
  slug: string;
}