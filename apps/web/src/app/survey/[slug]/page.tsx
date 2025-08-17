
import { Box, Container, Text, Button, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { InteractiveSurveyPreview } from '@/components/survey/InteractiveSurveyPreview'


interface SurveyData {
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
}



import { notFound } from 'next/navigation';

// Server Component: fetch survey data on the server
export default async function SurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch survey data from your API or DB (use absolute URL for fetch in server components)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  let surveyData: SurveyData | null = null;
  let error: string | null = null;

  try {
    const response = await fetch(`${baseUrl}/api/surveys/${slug}`, { cache: 'no-store' });
    if (response.status === 404) {
      notFound();
    }
    if (!response.ok) {
      throw new Error('Failed to load survey');
    }
    const data = await response.json();
    let surveyContent = data.content;
    if (typeof surveyContent === 'string') {
      try {
        surveyContent = JSON.parse(surveyContent);
      } catch {
        throw new Error('Survey data is malformed');
      }
    }
    if (!data.isActive) {
      error = 'This survey is no longer available';
    } else {
      surveyData = surveyContent;
    }
  } catch (err: unknown) {
    error = (err instanceof Error ? err.message : 'Failed to load survey');
  }

  if (error) {
    return (
      <Box minH="100vh" bg="#F7FAFC" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="md">
          <VStack gap={6} textAlign="center">
            <Text fontSize="48px">📋</Text>
            <Text fontSize="24px" fontWeight="bold" color="#2B6CB0">
              Survey Not Available
            </Text>
            <Text fontSize="16px" color="#4A5568">
              {error}
            </Text>
            <Link href="/">
              <Button
                bg="#2B6CB0"
                color="white"
                size="lg"
                _hover={{ bg: "#2556A3" }}
              >
                Go Home
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#F7FAFC" fontFamily="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif">
      <Container maxW="4xl" py={8}>
        <InteractiveSurveyPreview surveyData={surveyData} />
      </Container>
    </Box>
  );
}