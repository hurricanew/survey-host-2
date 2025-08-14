'use client'

import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  HStack, 
  Button, 
  Textarea, 
  Input, 
  Text,
  Flex
} from '@chakra-ui/react'
import { useState, useCallback } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useRouter } from 'next/navigation'
import { FiUpload, FiEye, FiLink } from 'react-icons/fi'

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
  const [isGenerating, setIsGenerating] = useState(false)

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

  const generateSurveyTitle = (content: string): string => {
    // Extract first line or first question as title
    const lines = content.trim().split('\n').filter(line => line.trim())
    if (lines.length === 0) return 'Untitled Survey'
    
    let title = lines[0].trim()
    // Remove common question prefixes
    title = title.replace(/^\d+\.\s*/, '').replace(/^[Qq]uestion\s*\d*:?\s*/i, '')
    // Truncate if too long
    if (title.length > 50) {
      title = title.substring(0, 47) + '...'
    }
    
    return title || 'Untitled Survey'
  }

  const handleGenerateLink = async () => {
    if (!surveyText.trim()) {
      showToast('Please enter survey content or upload a file', 'error')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: generateSurveyTitle(surveyText),
          content: surveyText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create survey')
      }

      const survey = await response.json()
      
      showToast(`Your survey "${survey.title}" has been created successfully`)
      
      // Navigate back to dashboard to see the new survey
      router.push('/dashboard')
    } catch (error) {
      console.error('Survey creation error:', error)
      showToast(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error')
    } finally {
      setIsGenerating(false)
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
              </VStack>
            </Box>

            {/* Right Panel - Live Preview */}
            <Box flex="1">
              <VStack align="stretch" gap={4}>
                <Heading fontSize="24px" fontWeight="bold">Live Preview</Heading>
                
                <Box 
                  minH="500px" 
                  bg="white" 
                  p={6} 
                  rounded="md" 
                  border="1px solid" 
                  borderColor="#4A5568"
                >
                  {surveyText ? (
                    <Box whiteSpace="pre-wrap" fontSize="16px">
                      {surveyText}
                    </Box>
                  ) : (
                    <Flex 
                      align="center" 
                      justify="center" 
                      minH="400px"
                      direction="column"
                      gap={3}
                    >
                      <FiEye size={32} color="#4A5568" />
                      <Text color="#4A5568" textAlign="center" fontSize="16px">
                        Your survey preview will appear here
                      </Text>
                    </Flex>
                  )}
                </Box>
              </VStack>
            </Box>
          </Flex>

          {/* Generate Link Button */}
          <HStack justify="center" gap={3} pt={4}>
            <Button
              bg="#2B6CB0"
              color="white"
              onClick={handleGenerateLink}
              disabled={!surveyText.trim() || isGenerating}
              size="lg"
              px={8}
              _hover={{ bg: "#2556A3" }}
              _disabled={{ bg: "#E2E8F0" }}
            >
              <FiLink /> {isGenerating ? 'Generating...' : 'Generate Link'}
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}