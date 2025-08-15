'use client'

import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  Button, 
  Textarea, 
  Input, 
  Text,
  Flex
} from '@chakra-ui/react'
import { useState, useCallback, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useRouter } from 'next/navigation'
import { FiUpload } from 'react-icons/fi'
import { InteractiveSurveyPreview } from '@/components/survey/InteractiveSurveyPreview'

interface ParsedSurvey {
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

export default function CreateSurveyPage() {
  return (
    <AuthGuard>
      <CreateSurveyContent />
    </AuthGuard>
  )
}

function CreateSurveyContent() {
  const router = useRouter()
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // Simple alert for now - can be replaced with proper toast later
    alert(`${type.toUpperCase()}: ${message}`)
  }, [])
  
  const [surveyText, setSurveyText] = useState('')
  const [parsedSurvey, setParsedSurvey] = useState<ParsedSurvey | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Simple debounce implementation
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [value, delay])

    return debouncedValue
  }

  const debouncedSurveyText = useDebounce(surveyText, 500)

  // Parse survey text when it changes
  useEffect(() => {
    const parseSurvey = async (text: string) => {
      if (!text.trim()) {
        setParsedSurvey(null)
        setParseError(null)
        return
      }

      setIsParsing(true)
      setParseError(null)

      try {
        const response = await fetch('/api/surveys/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to parse survey')
        }

        const result = await response.json()
        setParsedSurvey(result)
      } catch (error) {
        console.error('Parse error:', error)
        setParseError(error instanceof Error ? error.message : 'Failed to parse survey text')
        setParsedSurvey(null)
      } finally {
        setIsParsing(false)
      }
    }

    parseSurvey(debouncedSurveyText)
  }, [debouncedSurveyText])

  const handleFileUpload = useCallback((selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.txt')) {
      showToast('Please upload only .txt files', 'error')
      return
    }

    if (selectedFile.size > 1024 * 1024) { // 1MB limit
      showToast('Please upload files smaller than 1MB', 'error')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setSurveyText(text)
    }
    reader.readAsText(selectedFile)
  }, [showToast])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleSaveSurvey = async () => {
    if (!parsedSurvey) {
      showToast('Please enter valid survey content first', 'error')
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: parsedSurvey.title,
          description: parsedSurvey.description,
          content: parsedSurvey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to save survey')
      }

      const survey = await response.json()
      
      showToast(`Your survey "${survey.title}" has been saved successfully`)
      
      // Navigate back to dashboard to see the new survey
      router.push('/dashboard')
    } catch (error) {
      console.error('Survey save error:', error)
      showToast(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box minH="calc(100vh - 80px)" bg="#F7FAFC" fontFamily="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif">
      <Container maxW="7xl" py={8}>
        <VStack align="stretch" gap={8}>
          <VStack align="start" gap={2}>
            <Heading fontSize="32px" fontWeight="bold">Create New Survey</Heading>
            <Text color="#4A5568" fontSize="16px">
              Enter your survey content below or upload a text file to get started
            </Text>
          </VStack>

          {/* Parse Error Alert */}
          {parseError && (
            <Box p={4} bg="#FED7D7" border="1px solid #E53E3E" rounded="md">
              <Text fontSize="16px" color="#C53030">{parseError}</Text>
            </Box>
          )}

          <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
            {/* Left Panel - Input Section */}
            <Box flex="1">
              <VStack align="stretch" gap={4}>
                {/* File Upload Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FiUpload /> Upload File
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileInputChange}
                  hidden
                />

                {/* Large Textarea */}
                <Textarea
                  value={surveyText}
                  onChange={(e) => setSurveyText(e.target.value)}
                  placeholder="Enter your survey questions here..."
                  minH="500px"
                  bg="white"
                  fontSize="16px"
                  resize="vertical"
                  border="1px solid"
                  borderColor="#4A5568"
                />

                {isParsing && (
                  <Text fontSize="14px" color="#4A5568" fontStyle="italic">
                    Parsing survey text...
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Right Panel - Interactive Preview with Save Button */}
            <Box flex="1">
              <VStack align="stretch" gap={4}>
                <Flex justify="space-between" align="center">
                  <Heading fontSize="24px" fontWeight="bold">Interactive Preview</Heading>
                  {parsedSurvey && (
                    <Button
                      onClick={handleSaveSurvey}
                      bg="#2B6CB0"
                      color="white"
                      size="md"
                      disabled={isSaving}
                      _hover={{ bg: "#2556A3" }}
                      _disabled={{ bg: "#E2E8F0", color: "#A0AEC0" }}
                    >
                      {isSaving ? 'Saving...' : 'Save Survey'}
                    </Button>
                  )}
                </Flex>
                
                <InteractiveSurveyPreview
                  surveyData={parsedSurvey}
                />
              </VStack>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  )
}