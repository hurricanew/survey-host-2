'use client'

import { 
  Box, 
  Button, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Flex,
  Badge
} from '@chakra-ui/react'
import { useState, useCallback, useMemo } from 'react'
import { FiChevronLeft, FiChevronRight, FiRotateCcw } from 'react-icons/fi'

interface Question {
  id: number;
  text: string;
  options: Array<{
    id: string;
    text: string;
    score: number;
  }>;
}

interface ScoreRange {
  min: number;
  max: number;
  title: string;
  description: string;
}

interface SurveyData {
  title: string;
  description: string;
  questions: Question[];
  scoringGuide: {
    pointValues: string;
    totalPossible: number;
    ranges: ScoreRange[];
  };
  note?: string;
}

interface InteractiveSurveyPreviewProps {
  surveyData: SurveyData | null;
}

export function InteractiveSurveyPreview({ 
  surveyData
}: InteractiveSurveyPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = useCallback((questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNext = useCallback(() => {
    if (!surveyData) return;
    
    if (currentQuestionIndex < surveyData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Show results
      setShowResults(true);
    }
  }, [currentQuestionIndex, surveyData]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  }, []);

  // Memoize score calculation for performance
  const currentScore = useMemo(() => {
    if (!surveyData) return 0;
    
    return surveyData.questions.reduce((total, question) => {
      const selectedAnswer = answers[question.id];
      if (!selectedAnswer) return total;
      
      const option = question.options.find(opt => opt.id === selectedAnswer);
      return total + (option?.score || 0);
    }, 0);
  }, [answers, surveyData]);

  // Memoize score range calculation
  const currentScoreRange = useMemo(() => {
    if (!surveyData || !showResults) return null;
    
    return surveyData.scoringGuide.ranges.find(range => 
      currentScore >= range.min && currentScore <= range.max
    );
  }, [surveyData, currentScore, showResults]);

  if (!surveyData) {
    return (
      <Box 
        minH="500px" 
        bg="white" 
        p={6} 
        rounded="md" 
        border="1px solid" 
        borderColor="#E2E8F0"
      >
        <Flex 
          align="center" 
          justify="center" 
          minH="400px"
          direction="column"
          gap={3}
        >
          <Text color="#4A5568" textAlign="center" fontSize="16px">
            Enter survey text to see an interactive preview
          </Text>
        </Flex>
      </Box>
    );
  }

  if (showResults) {
    const maxScore = surveyData.scoringGuide.totalPossible;

    return (
      <Box 
        minH="500px" 
        bg="white" 
        p={6} 
        rounded="md" 
        border="1px solid" 
        borderColor="#E2E8F0"
      >
        <VStack align="stretch" gap={6}>
          <VStack align="center" gap={4}>
            <Heading fontSize="24px" color="#2B6CB0" textAlign="center">
              Survey Complete!
            </Heading>
            
            <Box textAlign="center">
              <Text fontSize="48px" fontWeight="bold" color="#2B6CB0">
                {currentScore}
              </Text>
              <Text fontSize="16px" color="#4A5568">
                out of {maxScore} points
              </Text>
            </Box>

            <Box w="100%" bg="#E2E8F0" rounded="full" h="8px">
              <Box
                bg="#2B6CB0"
                h="100%"
                rounded="full"
                w={`${(currentScore / maxScore) * 100}%`}
                transition="width 0.3s ease"
              />
            </Box>
          </VStack>

          {currentScoreRange && (
            <Box p={4} bg="#EBF8FF" border="1px solid #2B6CB0" rounded="md">
              <Text fontWeight="bold" fontSize="18px" color="#2B6CB0">
                {currentScoreRange.title}
              </Text>
              <Text mt={2} fontSize="16px" color="#4A5568">
                {currentScoreRange.description}
              </Text>
            </Box>
          )}

          {surveyData.note && (
            <Box p={4} bg="#F7FAFC" rounded="md">
              <Text fontSize="14px" color="#4A5568" fontStyle="italic">
                {surveyData.note}
              </Text>
            </Box>
          )}

          <HStack justify="center" gap={4}>
            <Button
              onClick={handleRestart}
              variant="outline"
              size="md"
            >
              <FiRotateCcw /> Take Again
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  const currentQuestion = surveyData.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / surveyData.questions.length) * 100;

  return (
    <Box 
      minH="500px" 
      bg="white" 
      p={6} 
      rounded="md" 
      border="1px solid" 
      borderColor="#E2E8F0"
    >
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Box>
          <Heading fontSize="20px" color="#2B6CB0" mb={2}>
            {surveyData.title}
          </Heading>
          <Text fontSize="14px" color="#4A5568">
            {surveyData.description}
          </Text>
        </Box>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontSize="14px" color="#4A5568">
              Question {currentQuestionIndex + 1} of {surveyData.questions.length}
            </Text>
            <Badge colorScheme="blue">
              {Math.round(progress)}% Complete
            </Badge>
          </Flex>
          <Box w="100%" bg="#E2E8F0" rounded="full" h="4px">
            <Box
              bg="#2B6CB0"
              h="100%"
              rounded="full"
              w={`${progress}%`}
              transition="width 0.3s ease"
            />
          </Box>
        </Box>

        {/* Question */}
        <Box>
          <Heading fontSize="18px" mb={4}>
            {currentQuestion.text}
          </Heading>
          
          <VStack align="stretch" gap={3}>
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                variant={selectedAnswer === option.id ? "solid" : "outline"}
                bg={selectedAnswer === option.id ? "#2B6CB0" : "white"}
                color={selectedAnswer === option.id ? "white" : "#4A5568"}
                border="1px solid"
                borderColor={selectedAnswer === option.id ? "#2B6CB0" : "#E2E8F0"}
                size="md"
                justifyContent="flex-start"
                textAlign="left"
                p={4}
                h="auto"
                whiteSpace="normal"
                _hover={{
                  bg: selectedAnswer === option.id ? "#2556A3" : "#F7FAFC",
                  borderColor: "#2B6CB0"
                }}
              >
                <HStack align="flex-start" w="100%">
                  <Text fontSize="16px" fontWeight="bold" color={selectedAnswer === option.id ? "white" : "#2B6CB0"}>
                    {option.id})
                  </Text>
                  <Text fontSize="16px" flex="1">
                    {option.text}
                  </Text>
                </HStack>
              </Button>
            ))}
          </VStack>
        </Box>

        {/* Navigation */}
        <HStack justify="space-between" pt={4}>
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="md"
            disabled={currentQuestionIndex === 0}
          >
            <FiChevronLeft /> Previous
          </Button>

          <Button
            onClick={handleNext}
            bg="#2B6CB0"
            color="white"
            size="md"
            disabled={!selectedAnswer}
            _hover={{ bg: "#2556A3" }}
            _disabled={{ bg: "#E2E8F0", color: "#A0AEC0" }}
          >
            {currentQuestionIndex === surveyData.questions.length - 1 ? (
              'Finish Survey'
            ) : (
              <>Next <FiChevronRight /></>
            )}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}